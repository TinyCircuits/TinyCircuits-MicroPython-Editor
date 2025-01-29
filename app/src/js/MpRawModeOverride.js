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

    async platform(){
        const cmd = `import sys\nprint(sys.implementation._machine)`;
        const output = await this.exec(cmd);

        if(output.indexOf("RP2350") != -1){
            return Platform.THUMBY_COLOR;
        }else if(output.indexOf("RP2040") != -1){
            return Platform.THUMBY;
        }else{
            return Platform.NONE;
        }
    }

    async dateVersion(){
        const cmd = `
try:
    import engine_main
    import engine
    print(engine.firmware_date())
except:
    try:
        import thumby 
        print(thumby.__version__)
    except:
        print("00-00-00_00:00:00")
`;
        let output = await this.exec(cmd);
        output = output.split(/\r\n|\r|\n/);

        return output[output.length-2];
    }

    async showEditorConnected(platform){
        const cmd = `
import engine_main
import engine_draw

engine_draw.clear(0)
engine_draw.text(None, "Connected to\\n   Editor\\n\\n     :)\\n\\n Turn OFF &\\n ON to reset", 0xffff, 27, 38, 1, 1, 1.0)
engine_draw.update()
`;
        await this.exec(cmd);
    }
}

export default MpRawModeOverride;