// Expects 'littlefs.js' from littlefs-wasm to be included in html

class Littlefs{
    constructor(){
        this.FS_BLOCK_COUNT = 352;
        this.FS_BLOCK_SIZE = 4096;
        this.FS_FLASH_OFFSET = 0xa0000;
    }

    async init(){
        this.flash = new Uint8Array(this.FS_BLOCK_COUNT * this.FS_BLOCK_SIZE);

        this.littlefsObj = await littlefs();

        this.read = this.littlefsObj.addFunction(this.#flashRead.bind(this), 'iiiiii');
        this.prog = this.littlefsObj.addFunction(this.#flashProg.bind(this), 'iiiiii');
        this.erase = this.littlefsObj.addFunction(this.#flashErase.bind(this), 'iii');
        this.sync = this.littlefsObj.addFunction(() => 0, 'ii');

        this.writeFile = this.littlefsObj.cwrap(
            'lfs_write_file',
            ['number'],
            ['number', 'string', 'number', 'number']
        );
    
        this.mkDir = this.littlefsObj.cwrap(
            'lfs_mkdir',
            ['number'],
            ['number', 'string']
        );

        this.config = this.littlefsObj._new_lfs_config(this.read, this.prog, this.erase, this.sync, this.FS_BLOCK_COUNT, this.FS_BLOCK_SIZE);
        this.lfs = this.littlefsObj._new_lfs();
        this.littlefsObj._lfs_format(this.lfs, this.config);
        this.littlefsObj._lfs_mount(this.lfs, this.config);
    }


    #flashRead(cfg, block, off, buffer, size){
        const start = block * this.FS_BLOCK_SIZE + off;
        this.littlefsObj.HEAPU8.set(this.flash.subarray(start, start + size), buffer);
    }

    #flashProg(cfg, block, off, buffer, size){
        const start = block * this.FS_BLOCK_SIZE + off;
        this.flash.set(this.littlefsObj.HEAPU8.subarray(buffer, buffer + size), start);
        return 0;
    }

    #flashErase(cfg, block){
        const start = block * this.FS_BLOCK_SIZE;
        this.flash.fill(0xff, start, start + this.FS_BLOCK_SIZE);
        return 0;
    }


    #createPath(filePath){
        var dirs = filePath.split('/').slice(1);
        var path = "";
      
        for(var i=0; i<dirs.length-1; i++){
          path = path + "/" + dirs[i];
          this.mkDir(this.lfs, path);
        }
    }


    async saveFile(filePath, data){
        this.#createPath(filePath);

        let buffer = this.littlefsObj._malloc(data.length * data.BYTES_PER_ELEMENT);
        this.littlefsObj.HEAPU8.set(data, buffer);
        this.writeFile(this.lfs, filePath, buffer, data.length);
        this.littlefsObj._free(buffer);
    }
}

export { Littlefs }