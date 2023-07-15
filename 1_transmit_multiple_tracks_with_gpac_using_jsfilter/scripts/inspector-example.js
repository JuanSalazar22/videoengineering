filter.pids = [];

//metadata
filter.set_name("JSInspect");
filter.set_desc("JS-based inspect filter");
filter.set_version("0.1beta");
filter.set_author("GPAC team");
filter.set_help("This filter provides a very simple javascript inspecter, mostly for test purposes of Javascrip filter bindings");

//exposed arguments
filter.set_arg({name: "raw", desc: "if set, accept undemuxed input PIDs", type: GF_PROP_BOOL, def: "false"});
filter.set_arg({
    name: "fwd",
    desc: "if set, forward incoming packets to output PIDs",
    type: GF_PROP_BOOL,
    def: "false"
});

filter.initialize = function () {
    print(GF_LOG_INFO, "Init at " + Date() + " nb pids " + this.pids.length + " - forward mode " + this.fwd);

    if (this.raw)
        this.set_cap({id: "StreamType", value: "Unknown", excluded: true});
    else
        this.set_cap({id: "StreamType", value: "File", excluded: true});
}

filter.update_arg = function (name, val) {
    print(GF_LOG_INFO, "Value " + name + " is " + val);
}

filter.configure_pid = function (pid) {
    if (this.pids.indexOf(pid) < 0) {
        print(GF_LOG_INFO, "Configure Pid " + typeof pid);
        let evt = new FilterEvent(GF_FEVT_PLAY);
        evt.start_range = 0.0;
        print(evt.start_range);
        pid.send_event(evt);
        this.pids.push(pid);
        pid.nb_pck = 0;
        pid.done_eos = false;

        if (this.fwd == true) {
            pid.opid = this.new_pid();
            pid.opid.reset_props();//for coverage
            pid.opid.copy_props(pid);
            //all below are for coverage
            pid.opid.name = "JFS" + pid.name;
            pid.max_buffer = 100;
            pid.opid.loose_connect = true;
            pid.framing_mode = true;
            pid.opid.allow_direct_dispatch();
            pid.opid.resolve_file_template('myfile$PID$.txt');
            pid.query_caps('CodecID');
            pid.query_caps('MySuperProp', true);
            pid.get_clock_info();
            pid.opid.set_info('MyInfo', 'MyValue', true);
            pid.get_info('Cached');
        }
    } else {
        print(GF_LOG_INFO, "Reconfigure Pid " + pid.name);
    }

    //all below are for coverage
    let i = 0;
    while (1) {
        let prop = pid.enum_properties(i);
        if (!prop) break;
        i++;
        let str = "Prop ";
        str += prop.name;
        str += " (type ";
        str += prop.type;
        str += " ): ";
        str += JSON.stringify(prop.value);
        print(GF_LOG_INFO, str);

        if (this.fwd == true) {
            pid.opid.set_prop(prop.name, prop.value);
        }
    }

    let prop = pid.get_prop("CodecID");
    print(GF_LOG_INFO, "Parent filter is " + pid.filter_name);
    print(GF_LOG_INFO, "Args are " + pid.args);
    print(GF_LOG_INFO, "Source filter is " + pid.src_name);
    print(GF_LOG_INFO, "Source args are " + pid.src_args);

    //coverage for filter object
    if (!filter.fwd) return;

    print(filter.block_enabled);
    print(filter.output_buffer);
    print(filter.output_playout);
    print(filter.sep_args);
    print(filter.sep_name);
    print(filter.sep_list);
    print(filter.dst_args);
    print(filter.dst_name);
    print(filter.sinks_done);
    print(filter.reports_on);
    print(filter.max_screen_width);
    print(filter.max_screen_height);
    print(filter.max_screen_depth);
    print(filter.max_screen_fps);
    print(filter.max_screen_views);
    print(filter.max_audio_channels);
    print(filter.max_audio_samplerate);
    print(filter.max_audio_depth);
    print(filter.events_queued);
    print(filter.clock_hint_us);
    print(filter.clock_hint_mediatime);
    filter.max_pids = -1;
    filter.max_screen_width = 320;
    filter.max_screen_height = 240;
    filter.max_screen_depth = 8;
    filter.max_screen_fps = 30;
    filter.max_screen_views = 2;
    filter.max_audio_channels = 2;
    filter.max_audio_samplerate = 44100;
    filter.max_audio_depth = 16;
    filter.is_supported_mime('video/mp4');
    filter.is_supported_source('http://foo.bar/test.mp4');
    filter.update_status('Connected');

    let evt = new FilterEvent(GF_FEVT_QUALITY_SWITCH);
    filter.send_event(evt);
    filter.get_info('Cached');

    filter.post_task(function () {
        print(GF_LOG_INFO, "task callback at " + Date());
        return -1;
    });
    filter.hint_clock(0, 0);
    filter.notify_failure(GF_OK);
    filter.send_update(null, 'foo', 'bar', 0);
    filter.make_sticky();
    filter.prevent_blocking(false);
    filter.block_eos(false);
}

filter.process = function () {
    this.pids.forEach(
        function (pid) {
            let index = this.pids.indexOf(pid)
            print(GF_LOG_INFO, "PID information: " + json.stringify(this.pids[index]));
        }
    );

    this.reschedule(0);
}

filter.remove_pid = function (pid) {
    let index = this.pids.indexOf(pid);
    if (index > -1) {
        this.pids.splice(index, 1);
    }
}

filter.process_event = function (pid, evt) {
    if (evt.type != GF_FEVT_USER) {
        return;
    }
}
