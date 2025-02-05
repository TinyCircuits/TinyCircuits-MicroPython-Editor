import { MpRawMode } from "ViperIDE/src/rawmode";
import { Platform } from "../App";

class MpRawModeOverride extends MpRawMode{

    constructor(port){
        super(port);
    }

    static async begin(port, soft_reboot=false) {
        const res = new MpRawModeOverride(port)
        await res.enterRawRepl(soft_reboot)
        try {
            await res.exec(`import sys,os`)
        } catch (err) {
            await res.end()
            throw err
        }
        return res
    }

    parseDirectoryListing(input) {
        // Remove the surrounding brackets and split the string into individual tuples
        let tuples = input.slice(1, -1).split('),(');
        
        // Process each tuple
        let result = tuples.map(tuple => {
            // Remove any remaining parentheses and split the tuple into its components
            let parts = tuple.replace(/[\[\]\(\)]/g, '').split(',');
            
            // Extract and trim each part
            let name = parts[0].trim().replace(/^"|"$/g, '');
            let typeCode = parseInt(parts[1].trim());
            let inode = parseInt(parts[2].trim());
            let size = parseInt(parts[3].trim());
            
            // Determine the type based on the type code
            let type = typeCode === 16384 ? 'directory' : typeCode === 32768 ? 'file' : 'unknown';
            
            // Return an object with the extracted properties
            return {
                name: name,
                type: type,
                inode: inode,
                size: size
            };
        });
        
        return result;
    }

    async listDir(fn) {
        let buf = '';

        const cmd = `import os\nfor f in os.ilistdir('${fn}'):\n print(repr(f), end=',')`;
        try {
            buf += '[';
            buf += await this.exec(cmd);
            buf += ']';
        } catch (e) {
            throw new Error(e);
        }

        if(buf != "[]"){
            return this.parseDirectoryListing(buf);
        }else{
            return [];
        }
    }

    async deleteFileOrDir(path){
        let cmd = `
import os
def rm(d):  # Remove file or tree
    try:
        if os.stat(d)[0] & 0x4000:  # Dir
            for f in os.ilistdir(d):
                if f[0] not in ('.', '..'):
                    rm('/'.join((d, f[0])))  # File or Dir
            os.rmdir(d)
        else:  # File
            os.remove(d)
    except Exception as e:
        raise Exception('rm_failed: ' + str(e) + " " + d)
rm('${path}')
`;
        await this.exec(cmd);
    }

    async platform(){
        // const cmd = `import sys\nprint(sys.implementation._machine)`;
        const cmd = `
try:
    import engine
    print("THUMBY_COLOR")
except:
    try:
        import thumby
        print("THUMBY")
    except:
        print("NONE")
`
        const output = await this.exec(cmd);

        if(output.indexOf("THUMBY_COLOR") != -1){
            return Platform.THUMBY_COLOR;
        }else if(output.indexOf("THUMBY") != -1){
            return Platform.THUMBY;
        }else{
            return Platform.NONE;
        }
    }

    async dateVersion(platform){
        let cmd = undefined;

        if(platform == Platform.THUMBY_COLOR){
            cmd = `
try:
    import engine_main
    import engine
    print(engine.firmware_date())
except:
    print("00-00-00_00:00:00")
`;
        }else if(platform == Platform.THUMBY){
            cmd = `
try:
    import thumby 
    print(thumby.__version__)
except:
    print("0.0")
`;
        }else{

        }

        let output = await this.exec(cmd);
        output = output.split(/\r\n|\r|\n/);

        return output[output.length-2];
    }

    async showEditorConnected(platform){
        const cmd = `
import engine_main
import engine_draw

try:
    engine_draw.clear(0)
    engine_draw.text(None, "Connected to\\n   Editor\\n\\n     :)\\n\\n Turn OFF &\\n ON to reset", 0xffff, 27, 38, 1, 1, 1.0)
    engine_draw.update()
except:
    pass
`;
        await this.exec(cmd);
    }

    async bootloader(){
        const cmd = `
import machine
machine.bootloader()
`
        await this.exec(cmd);
    }

    async rename(old_path, new_path){
        const cmd = `
import os
os.rename("`+ old_path + `", "` + new_path +`")
`
    }
}

export default MpRawModeOverride;