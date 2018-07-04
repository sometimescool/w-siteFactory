type PromiseResolve<T> = (value?: T | PromiseLike<T>) => void;
type PromiseReject = (error?: any) => void;
declare var Promise: any;

import { CDom } from "../helpers/helper";
import { CImageDetailView } from "./view";

class CImageDetail {
    private static _instance: CImageDetail = new CImageDetail();
    private view: CImageDetailView;
    constructor() {
        if (CImageDetail._instance) {
            throw new Error("Error: Instantiation failed: Use CImageDetail.getInstance() instead of new.");
        }
        this.view = new CImageDetailView();
        CImageDetail._instance = this;
    }
    public static getInstance(): CImageDetail {
        return CImageDetail._instance;
    }
    public zoom(imgUrl: string, maxwidth: number):void {
        this.destroy();
        this.view.draw(imgUrl, maxwidth);
        this.triggerEvents();
    }
    private triggerEvents():void{
        this.view.$btnclose.get(0).addEventListener("click",(e:Event) => this.close(e),false);
    }
    private close(e: Event){
        this.destroy();
    }
    private destroy(): void {
        //clean events
        if(this.view.$btnclose)
            this.view.$btnclose.get(0).removeEventListener("click",(e:Event) => this.close(e),false);
        //clean HTML
        this.view.destroy();
    }
}
function triggerEvents($img:JQuery<HTMLElement>,$trigger:JQuery<HTMLElement> | null,maxWidth:number | null):void {
    let $triggerElement:JQuery<HTMLElement>=$trigger || $img;
    if($triggerElement.length > 0) $triggerElement.get(0).addEventListener("click",(e:Event) => CImageDetail.getInstance().zoom($img.attr("src"),maxWidth),false);
}
function toFrameImage($img:JQuery<HTMLElement>,noicon:boolean,maxWidth:number | null){
    let $btn:JQuery<HTMLElement> | null=null
    if(!noicon){
        let $frame:JQuery<HTMLElement>=jQuery(`<div class="sf-frame-imgDetail"></i></div>`);
        $btn=jQuery(`<span class="sf-imgDetail-open"><i class="sf-icon-resize-full-2"></i></span>`);
        $frame.append($btn);
        $frame.insertBefore($img);
        $img.appendTo($frame);
    }
    triggerEvents($img,$btn,maxWidth);
}
export function imageDetailFactory(maxWidth:number | null):void{
    jQuery(".sf-imgDetail").each((index, el) => {
        let $img: JQuery<HTMLElement> = jQuery(el);
        let noicon:boolean=$img.hasClass("sf-noicon");
        toFrameImage($img,noicon,maxWidth);
    })
}