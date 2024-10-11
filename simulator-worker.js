import {loadMicroPython} from "./micropython.mjs"

const stdoutWriter = (line) => {
    postMessage({message_type:"print_update", value:line});
};

let web_pressed_buttons_buffer = undefined;
let screen_buffer = undefined;
let typed_chars_buffer = undefined;

// const mp = await loadMicroPython({stdout:stdoutWriter});

async function writeFilesystemFile(mp, fetchPath, filePath){

    // Create the path to the file
    let path = filePath.substring(0, filePath.lastIndexOf("/"));
    mp.FS.mkdirTree(path);

    // Get the file and write it
    let data = await (await fetch(fetchPath)).arrayBuffer();
    data = new Uint8Array(data);
    mp.FS.writeFile(filePath, data);
}


async function writeFilesystem(mp){
    await writeFilesystemFile(mp, "./simulator/filesystem/system/assets/outrunner_outline.bmp", "system/assets/outrunner_outline.bmp");

    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/assets/arrow.bmp", "system/launcher/assets/arrow.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/assets/battery.bmp", "system/launcher/assets/battery.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/assets/launcher-background.bmp", "system/launcher/assets/launcher-background.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/assets/launcher-credits-header.bmp", "system/launcher/assets/launcher-credits-header.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/assets/launcher-games-header.bmp", "system/launcher/assets/launcher-games-header.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/assets/launcher-header-island.bmp", "system/launcher/assets/launcher-header-island.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/assets/launcher-screen-credits-icon.bmp", "system/launcher/assets/launcher-screen-credits-icon.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/assets/launcher-screen-gear-icon.bmp", "system/launcher/assets/launcher-screen-gear-icon.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/assets/launcher-screen-thumby-color-icon.bmp", "system/launcher/assets/launcher-screen-thumby-color-icon.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/assets/launcher-settings-header.bmp", "system/launcher/assets/launcher-settings-header.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/assets/launcher-tile-qmark.bmp", "system/launcher/assets/launcher-tile-qmark.bmp");

    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/battery_indicator.py", "system/launcher/battery_indicator.py");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/credits_screen.py", "system/launcher/credits_screen.py");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/custom_camera.py", "system/launcher/custom_camera.py");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/direction_icon.py", "system/launcher/direction_icon.py");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/dynamic_background.py", "system/launcher/dynamic_background.py");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/games_screen.py", "system/launcher/games_screen.py");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/header.py", "system/launcher/header.py");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/launcher.py", "system/launcher/launcher.py");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/screen_icon.py", "system/launcher/screen_icon.py");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/settings_screen.py", "system/launcher/settings_screen.py");

    await writeFilesystemFile(mp, "./simulator/filesystem/system/splash/assets/b.bmp", "system/splash/assets/b.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/splash/assets/C.bmp", "system/splash/assets/C.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/splash/assets/GO.bmp", "system/splash/assets/GO.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/splash/assets/h.bmp", "system/splash/assets/h.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/splash/assets/L.bmp", "system/splash/assets/L.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/splash/assets/m.bmp", "system/splash/assets/m.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/splash/assets/R.bmp", "system/splash/assets/R.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/splash/assets/RO.bmp", "system/splash/assets/RO.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/splash/assets/T.bmp", "system/splash/assets/T.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/splash/assets/u.bmp", "system/splash/assets/u.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/splash/assets/y.bmp", "system/splash/assets/y.bmp");

    await writeFilesystemFile(mp, "./simulator/filesystem/system/splash/show_splash.py", "system/splash/show_splash.py");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/splash/splash.py", "system/splash/splash.py");

    await writeFilesystemFile(mp, "./simulator/filesystem/system/crash.py", "system/crash.py");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/credits_1_testers.csv", "system/credits_1_testers.csv");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/credits_2_collectors.csv", "system/credits_2_collectors.csv");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/credits_3_special.csv", "system/credits_3_special.csv");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher_state.py", "system/launcher_state.py");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/run_on_boot.py", "system/run_on_boot.py");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/util.py", "system/util.py");

    await writeFilesystemFile(mp, "./simulator/filesystem/main.py", "main.py");

    // console.log(mp.FS.readdir("/"));
}

// writeFilesystem();

async function test(){

    const mp = await loadMicroPython({stdout:stdoutWriter});

    await writeFilesystem(mp);

    // This JS function is called from C code in micropython
    // using the VM hook in mpportconfig.h. This allows for
    // doing anything while only micropython is running
    // and not just the engine 
    self.get_serial = () => {
        let typed_chars = new Uint8Array(typed_chars_buffer);

        if(typed_chars[0] == 1){
            console.log(typed_chars);

            // Process all buffered chars until see one that's 0, then stop
            for(let i=1; i<typed_chars.length; i++){
                if(typed_chars[i] == 0){
                    break;
                }else{
                    mp.replProcessChar(typed_chars[i]);
                }
            }

            // Tell the page we're ready for more data
            typed_chars[0] = 0;
            postMessage({message_type:"ready_for_more_typed_chars"});
        }
    }

    // This JS function is called from C code in the engine
    self.get_pressed_buttons = () => {
        let web_pressed_buttons = new Uint16Array(web_pressed_buttons_buffer)
        return web_pressed_buttons[0];
    }

    // This JS function is called from C code in the engine
    self.update_display = (screen_buffer_to_render_ptr) => {

        let buffer = new Uint8Array(screen_buffer);

        for(let ipx=0; ipx<128*128*2; ipx++){
            buffer[ipx] = mp._module.HEAPU8[screen_buffer_to_render_ptr+ipx];
        }

        postMessage({message_type:"screen_update"});
    }

    // console.log(mp)
    // console.log(mp.FS)
    // console.log(mp.FS.readdir("/"))

    // mp.runPythonAsync(`execfile("main.py")`);
//     mp.runPythonAsync(`
// import engine_main

// import engine
// import engine_draw
// import engine_io
// import engine_physics
// import math
// from engine_math import Vector2
// from engine_nodes import Rectangle2DNode, Circle2DNode, CameraNode, PhysicsRectangle2DNode, PhysicsCircle2DNode

// engine.fps_limit(120)
// engine_physics.set_gravity(0, 0)


// ball_dia_mm = 57.15 # https://images.app.goo.gl/sfgWqEnEr52cXHUD8
// ball_dia_with_margin_mm = ball_dia_mm + 5
// hole_dia_mm = 133   # https://images.app.goo.gl/YDCsrbHLMnVDQ7eu7

// # https://images.app.goo.gl/nDPWRLb662uDcdA2A
// table_inside_len_mm = 2240
// table_inside_wid_mm = 1120
// table_wall_thickness_mm = (1500 - 1120) / 2

// stick_len_mm = 1447.8
// stick_dia_mm = 25.4


// class Border(PhysicsRectangle2DNode):
//     def __init__(self, direction, length, position):
//         super().__init__(self)

//         if(direction == "h"):
//             self.width = length
//             self.height = table_wall_thickness_mm
//         elif(direction == "v"):
//             self.width = table_wall_thickness_mm
//             self.height = length

//         self.position = position
//         self.outline = True
//         self.dynamic = False


// class PowerIndicator(Rectangle2DNode):
//     def __init__(self):
//         super().__init__(self)

//         self.width = 36
//         self.height = 4
//         self.position.y = 64 - self.height/2 - 2
//         self.position.x = -64 + self.width/2 + 1
//         self.outline = True
//         self.color = engine_draw.blue
//         self.layer = 1

//         self.bar = Rectangle2DNode()
//         self.bar.width = self.width
//         self.bar.height = self.height
//         self.bar.position.y = 0
//         self.bar.position.x = 1
//         self.bar.color = engine_draw.green
//         self.bar.layer = 0

//         self.add_child(self.bar)

//         self.set_percent(0)

//     def set_percent(self, percent):
//         self.bar.width = (self.width) * percent
//         self.bar.position.x = 1 - self.width/2 + self.bar.width/2


// class Ball(PhysicsCircle2DNode):
//     def __init__(self):
//         super().__init__(self)

//         self.outline = True
//         self.radius = ball_dia_mm/2

//     def tick(self, dt):
//         vel_length = self.velocity.length()
//         if vel_length > 0.5:
//             normal = self.velocity.normalized()
//             self.velocity.x += -normal.x * 0.07
//             self.velocity.y += -normal.y * 0.07
//         elif vel_length > 0.0 and vel_length <= 0.5:
//             self.velocity.x = 0
//             self.velocity.y = 0


// class Stick(Rectangle2DNode):
//     def __init__(self, ball, power_indicator):
//         super().__init__(self)

//         self.ball = ball
//         self.ball.add_child(self)

//         self.power_indicator = power_indicator

//         self.power = 0
//         self.max_power = 35

//         self.outline = True
//         self.width = stick_dia_mm
//         self.height = stick_len_mm
//         self.position.y = self.height/2 + 25.4*4
//         self.color = engine_draw.brown

//     def tick(self, dt):
//         print(engine.get_running_fps())

//         # Rotation
//         if engine_io.LB.is_pressed:
//             self.ball.rotation -= 0.025
//         elif engine_io.RB.is_pressed:
//             self.ball.rotation += 0.025

//         # Power
//         if engine_io.DOWN.is_pressed:
//             self.power += 1

//             if self.power > self.max_power:
//                 self.power = self.max_power

//         percent = self.power / self.max_power
//         self.power_indicator.set_percent(self.power / self.max_power)

//         # Shoot
//         if engine_io.DOWN.is_just_released:
//             self.ball.velocity.x = -math.cos(self.ball.rotation - math.pi/2) * self.power
//             self.ball.velocity.y = math.sin(self.ball.rotation - math.pi/2) * self.power
//             self.power = 0


// class GameCamera(CameraNode):
//     def __init__(self):
//         super().__init__(self)

//     def tick(self, dt):
//         if engine_io.A.is_pressed:
//             self.zoom += 0.005
//         elif engine_io.B.is_pressed:
//             self.zoom -= 0.005


// camera = GameCamera()
// camera.zoom = 0.045

// power_indicator = PowerIndicator()
// camera.add_child(power_indicator)

// top_border = Border("h", table_inside_wid_mm-(hole_dia_mm*2), Vector2(0,   table_inside_len_mm/2 + table_wall_thickness_mm/2))
// bot_border = Border("h", table_inside_wid_mm-(hole_dia_mm*2), Vector2(0, -(table_inside_len_mm/2 + table_wall_thickness_mm/2)))

// left_border = Border("v", table_inside_len_mm-(hole_dia_mm*2), Vector2(-(table_inside_wid_mm/2 + table_wall_thickness_mm/2), 0))
// right_border = Border("v", table_inside_len_mm-(hole_dia_mm*2), Vector2(table_inside_wid_mm/2 + table_wall_thickness_mm/2, 0))

// ball = Ball()
// ball.add_child(camera)
// ball.position.y = table_inside_len_mm/3

// stick = Stick(ball, power_indicator)

// balls = []

// def rack_row(ball_count, x, y):
//     for i in range(ball_count):
//         b = Ball()
//         b.outline = True
//         b.radius = ball_dia_with_margin_mm/2
//         b.position.x = x
//         b.position.y = y
//         x += ball_dia_with_margin_mm
//         balls.append(b)

// rack_row(5, -ball_dia_with_margin_mm/2 - ball_dia_with_margin_mm - ball_dia_with_margin_mm/2, 0)
// rack_row(4, -ball_dia_with_margin_mm/2 - ball_dia_with_margin_mm, ball_dia_with_margin_mm)
// rack_row(3, -ball_dia_with_margin_mm, ball_dia_with_margin_mm*2)
// rack_row(2, -ball_dia_with_margin_mm/2, ball_dia_with_margin_mm*3)
// rack_row(1, 0, ball_dia_with_margin_mm*4)

// engine.start()
//     `);
}


onmessage = (e) => {
    if(e.data.message_type == "screen_buffer_set"){
        screen_buffer = e.data.value;
    }else if(e.data.message_type == "pressed_buttons_buffer_set"){
        web_pressed_buttons_buffer = e.data.value;
    }else if(e.data.message_type == "typed_chars_buffer_set"){
        typed_chars_buffer = e.data.value;
    }else if(e.data.message_type == "run"){
        test();
    }
};