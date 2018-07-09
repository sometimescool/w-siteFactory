type PromiseResolve<T> = (value?: T | PromiseLike<T>) => void;
type PromiseReject = (error?: any) => void;
declare var Promise: any;

import { CDom } from "../helpers/helper";
import { CImageDetailView } from "./view";
import { IOffset } from "./view";
import { ISizes } from "./view";
import { IPosition } from "./view";
import {orientation} from "../helpers/helper";

interface ICursorPos {
    x: number;
    y: number;
}
interface IRation {
    cx: number;
    cy: number;
}
class CImageDetail {
    private static _instance: CImageDetail = new CImageDetail();
    private view: CImageDetailView;
    private ratio: IRation = { cx: 0, cy: 0 };
    private imageUrl:string="";
    private width:number|undefined;
    /* uuid permet removeOrientationChange (inutile dans le context présent)*/
    private orientation:string;
    constructor() {
        if (CImageDetail._instance)
            throw new Error("Error: Instantiation failed: Use CImageDetail.getInstance() instead of new.");
        CImageDetail._instance = this;
        this.orientation=orientation.onOrientationChange((orientation:string)=>this.orientationChange(orientation));
    }
    private test(orientation:string):void{
        console.log(`test ${orientation}`);
    }
    private orientationChange(orientation:string):void{
        console.log(`Orientationchange CImageDetail${this.imageUrl}`)
        if(this.imageUrl!=""){
                console.log("zoom auto")
                this.zoom(this.imageUrl,this.width);
        }
    }
    public static getInstance(): CImageDetail {
        return CImageDetail._instance;
    }
    public zoom(imgUrl: string, maxwidth: number): void {
        orientation.removeOrientationChange(this.orientation);
        this.destroy();
        this.view = new CImageDetailView();
        this.imageUrl=imgUrl;
        this.width=maxwidth;
        let self:any=this;
        this.promiseImage(imgUrl).then((image:any)=>{
            self.view.draw(image, maxwidth);
            self.setRation();
            self.triggerEvents();
        })
    }
    private promiseImage(imageUrl:string): any {
		let self = this;
		try {
			return new Promise((resolve: PromiseResolve<any>, reject: PromiseReject): void => {
                let image:any= new Image();
                image.src = imageUrl;
                image.onload=()=>resolve(image);
                image.onerror=()=>reject("image");
			});
		} catch (e) { throw Error("Promise") }
	}
    private setRation(): void {
        let squareOffset: IOffset = this.view.squareOffset();
        let resultOffset: IOffset = this.view.resultOffset();
        let imageSizes: ISizes = this.view.imageSizes();
        this.ratio.cx = resultOffset.width / squareOffset.width;
        this.ratio.cy = resultOffset.height / squareOffset.height;
        this.view.resultBackGroundSize(imageSizes.width * this.ratio.cx, imageSizes.height * this.ratio.cy);
    }
    private triggerEvents(): void {
        this.view.$container.get(0).addEventListener("click", (e: Event) => this.handleClick(e), false);
        this.view.$container.get(0).addEventListener("mousemove", (e: Event) => this.handleMouseMove(e), false);
        this.view.$container.get(0).addEventListener("touchmove", (e: Event) => this.handleMouseMove(e), false)
    }
    private handleMouseMove(e: any): void {
        let el: HTMLElement = e.target as HTMLElement;
        el = CDom.mouseMoveHandler(el);
        if (el) {
            switch (CDom.dataMouseMove(el)) {
                case "move-square":
                case "move-image":
                    this.moveSquare(e);
                    break;
            }
        }
    }
    private handleClick(e: Event): void {
        let el: HTMLElement = e.target as HTMLElement;
        el = CDom.clickHandler(el);
        if (el) {
            switch (CDom.dataClick(el)) {
                case "img-detail-close":
                    this.close();
                    break;
            }
        }
    }
    private close(): void {
        this.destroy();
    }
    private destroy(): void {
        this.imageUrl="";
        this.width=undefined;
        //clean events
        if (this.view) {
            this.view.$container.get(0).removeEventListener("click", (e: Event) => this.handleClick(e), false);
            this.view.$container.get(0).removeEventListener("mousemove", (e: Event) => this.handleMouseMove(e), false);
            this.view.$container.get(0).removeEventListener("touchmove", (e: Event) => this.handleMouseMove(e), false);
            this.view.destroy();
            this.view=null;
        }
    }
    private moveSquare(e: any): void {
        let pos: ICursorPos, squareOffset: IOffset, imgSizes: ISizes, x: number, y: number;
        /*prevent any other actions that may occur when moving over the image*/
        e.preventDefault();
        /*get sizes position end offset */
        pos = this.getCursorPos(e);
        squareOffset = this.view.squareOffset();
        imgSizes = this.view.imageSizes();
        /*calculate the position of the square:*/
        x = pos.x - (squareOffset.width / 2);
        y = pos.y - (squareOffset.height / 2);
        /*prevent the square from being positioned outside the image:*/
        if (x > imgSizes.width - squareOffset.width) { x = imgSizes.width - squareOffset.width }
        if (x < 0) { x = 0; }
        if (y > imgSizes.height - squareOffset.height) { y = imgSizes.height - squareOffset.height }
        if (y < 0) { y = 0; }
        /*set the position of the square:*/
        this.view.squarePosition({ left: x, top: y });
        /*move result background*/
        this.view.resultBackGroundPosition((x * this.ratio.cx), (y * this.ratio.cy));
    }
    private getCursorPos(e: any): ICursorPos {
        let cursorPos: ICursorPos = { x: 0, y: 0 };
        let a: IPosition, x: number, y: number;
        let event: any = e || window.event;
        /*get the x and y positions of the image:*/
        a = this.view.imagePosition();
        /*calculate the cursor's x and y coordinates, relative to the image:*/
        x = event.pageX - a.left;
        y = event.pageY - a.top;
        /*consider any page scrolling:*/
        cursorPos.x = x - window.pageXOffset;
        cursorPos.y = y - window.pageYOffset;
        return cursorPos;
    }
}
/*Mise en place du bouton d'ouverture du composant sur l'image à zoomer*/
function triggerEvents($img: JQuery<HTMLElement>, $trigger: JQuery<HTMLElement> | null, maxWidth: number | null): void {
    let $triggerElement: JQuery<HTMLElement> = $trigger || $img;
    let src:string=$img.data("detail") || $img.attr("src");
    let img:any=new Image();
    img.src=src;
    if ($triggerElement.length > 0) $triggerElement.get(0).addEventListener("click", (e: Event) => CImageDetail.getInstance().zoom(src, maxWidth), false);
}
function toFrameImage($img: JQuery<HTMLElement>, noicon: boolean, maxWidth: number | null) {
    let $btn: JQuery<HTMLElement> | null = null
    if (!noicon) {
        let $frame: JQuery<HTMLElement> = jQuery(`<div class="sf-frame-imgDetail"></i></div>`);
        $btn = jQuery(`<span class="sf-imgDetail-open"><i class="sf-icon-resize-full-2"></i></span>`);
        $frame.append($btn);
        $frame.insertBefore($img);
        $img.appendTo($frame);
    }
    triggerEvents($img, $btn, maxWidth);
}
/* */
export function imageDetailFactory(maxWidth: number | null): void {
    jQuery(".sf-imgDetail").each((index, el) => {
        let $img: JQuery<HTMLElement> = jQuery(el);
        let noicon: boolean = $img.hasClass("sf-noicon");
        toFrameImage($img, noicon, maxWidth);
    })
}