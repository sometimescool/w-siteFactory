type PromiseResolve<T> = (value?: T | PromiseLike<T>) => void;
type PromiseReject = (error?: any) => void;
declare var Promise: any;

import { CDom } from "../helpers/helper";

class CImgZoom{
    private static _instance:CImgZoom = new CImgZoom();
    $container:JQuery<HTMLElement> | null=null;
    $frame:JQuery<HTMLElement> | null=null;
    constructor(){
        if(CImgZoom._instance){
            throw new Error("Error: Instantiation failed: Use CImgZoom.getInstance() instead of new.");
        }
        CImgZoom._instance = this;
    }
    public static getInstance():CImgZoom
    {
        return CImgZoom._instance;
    }
    public zoom($img:JQuery<HTMLElement>,maxWidth:number | null):void{
        let self=this;
        if(this.$container){
            this.destroy()
        }
        if($img){
            this.promiseImageSizes($img).then(
                (sizes:any)=>{
                    self.$container=self.mainContainer();
                    self.$frame=self.frame(maxWidth?Math.min(sizes.width,maxWidth):sizes.width);
                    let $btnClose:JQuery<HTMLElement>=self.closeButton();
                    self.$frame.append($btnClose);
                    self.$frame.append(self.cloneCleanImage($img));
                    self.$container.append(self.$frame);
                    let $body = jQuery("body");
                    $body.append(self.$container);
                    setTimeout(()=>{if(self.$frame) self.$frame.css("opacity",1)},50);
                }
            )
        }
    }
    private mainContainer():JQuery<HTMLElement>{
        return jQuery(`<div class="sf-imgzoom-container"></div>`);
    }
    private frame(width:number):JQuery<HTMLElement>{
        let $frame:JQuery<HTMLElement>=jQuery(`<div class="sf-image-frame"></div>`);
        $frame.css("max-width",`${width}px`);
        $frame.css("opacity",0);
        return $frame;
    }
    private closeButton():JQuery<HTMLElement>{
        let $close:JQuery<HTMLElement>=jQuery(`<div class="sf-close-zoom" data-click="zoom-close"><span class="sf-close-zoom-btn sf-icon-cancel "></span></div>`);
        $close.get(0).addEventListener("click",(e:Event) => this.close(e),false);
        return $close;
    }
    private cloneCleanImage($img:JQuery<HTMLElement>):JQuery<HTMLElement>{
        let $imgResize:JQuery<HTMLElement>=$img.clone();
        $imgResize.removeAttr("height").removeAttr("width").removeAttr("sizes").removeClass();
        $imgResize.addClass("sf-zoom-image");
        return $imgResize;
    }
    private promiseImageSizes($img:JQuery<HTMLElement>): any {
		let self = this;
		try {
			return new Promise((resolve: PromiseResolve<any>, reject: PromiseReject): void => {
                let image:any= new Image();
                image.src = $img.attr("src");
                image.onload=()=>resolve({width:image.width,height:image.height});
                image.onerror=()=>reject("image");
			});
		} catch (e) { throw Error("Promise") }
	}
    private close(e: Event):void{
        if(this.$frame) this.$frame.css("opacity",0);
        setTimeout(()=>this.destroy(),1000);
    }
    private destroy(){
        if(this.$frame)  this.$frame.remove();
        if(this.$container){
            this.$container.get(0).removeEventListener("click", (e: Event) => this.close(e), false);
            this.$container.remove();
        }
        this.$container=null;
        this.$frame=null;
    }
}
function triggerEvents($img:JQuery<HTMLElement>,$trigger:JQuery<HTMLElement> | null,maxWidth:number | null):void {
    let $triggerElement:JQuery<HTMLElement>=$trigger || $img;
    if($triggerElement.length > 0) $triggerElement.get(0).addEventListener("click",(e:Event) => CImgZoom.getInstance().zoom($img,maxWidth),false);
}
function toFrameImage($img:JQuery<HTMLElement>,noicon:boolean,maxWidth:number | null){
    let $btn:JQuery<HTMLElement> | null=null
    if(!noicon){
        let $frame:JQuery<HTMLElement>=jQuery(`<div class="sf-frame-image"></i></div>`);
        $btn=jQuery(`<span class="sf-zoom-open"><i class="sf-icon-resize-full-2"></i></span>`);
        $frame.append($btn);
        $frame.insertBefore($img);
        $img.appendTo($frame);
    }
    triggerEvents($img,$btn,maxWidth);
}
export function imageZoomFactory(maxWidth:number | null):void{
    jQuery(".sf-imgZoom").each((index, el) => {
        let $img: JQuery<HTMLElement> = jQuery(el);
        let noicon:boolean=$img.hasClass("sf-noicon");
        toFrameImage($img,noicon,maxWidth);
    })
}