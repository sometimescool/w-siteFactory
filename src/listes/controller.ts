import { CDom } from "../helpers/helper";

abstract class CList {
    $list: JQuery<HTMLElement>;
    $li: JQuery<HTMLElement>;
    constructor(typeList:string) {
        this.$list = jQuery(`.sf-hierarchy.${typeList}`);
        this.$li= jQuery('li',this.$list);
        this.setLiContainer();
    }
    protected setLiContainer():void{
    }

}

class CListFolder extends CList {
    constructor(typeList:string) {
        super(typeList);
    }
    protected setLiContainer():void{
        this.$li.has("ul").addClass("sf-icon-folder-open sf-container");
        jQuery("li:not(:has(ul))",this.$list).addClass("sf-icon-doc sf-contents");
    }
}
export function listFolder(): void {
    let list: CListFolder = new CListFolder("sf-type-folder");
}