class SpriteList{
    constructor(DivSpriteList){
        this.divSpriteList = DivSpriteList;

        this.addSpriteBtnHTML = `
        <button class="w-8 h-8 stroke-white hover:stroke-black border border-black rounded-full bg-black hover:bg-white text-white hover:text-black active:bg-black active:text-white duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-full w-full" viewBox="0 0 20 20" fill="currentColor" stroke-width="1">
                <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
        </button>
        `;

        this.addSpriteBtn = document.createElement("button");
        this.addSpriteBtn.innerHTML = this.addSpriteBtnHTML;
        this.divSpriteList.appendChild(this.addSpriteBtn);

        this.spritePreviewHTML = `
        <div>
            test
        </div>
        `;

        // this.divSpriteList.appendChild(this.addSpriteBtnHTML);
        
        // console.log(DOMParser.parseFromString(this.addSpriteBtnHTML));
    }

    
    #addSpritePreview(){

    }
}

export { SpriteList };