
export interface IOffset {
    width: number;
    height: number;
}
export interface ISizes {
    width: number;
    height: number;
}
export interface IPosition {
    left: number;
    top: number;
}
export class CImageDetailView {
    public $container: JQuery<HTMLElement> | null;
    private $image: JQuery<HTMLElement> | null;
    private $detail: JQuery<HTMLElement> | null;
    private $btnclose: JQuery<HTMLElement> | null;
    private $square: JQuery<HTMLElement> | null;
    constructor() {

    }
    public draw(image: any, maxwidth: number) {
        let maxheight: number = window.outerHeight - (window.outerHeight*20/100 + 30);
        this.$detail = jQuery(`<div class="sf-img-detail-result" style="background-image:url('${image.src}')"></div>`);
        this.$image = jQuery(`<div class="sf-img-detail-image" data-mouse-move="move-image"></div>`);
        this.$square = jQuery(`<div class="sf-img-detail-square" data-mouse-move="move-square"></div>`);
        this.$image.append(this.$square)
        this.$image.append(`<img style="max-height:${maxheight}px" src="${image.src}">`);
        this.$btnclose = jQuery(`<div class="sf-close-img-detail" data-click="img-detail-close"><span class="sf-close-img-detail-btn sf-icon-cancel "></span></div>`);
        let $frame: JQuery<HTMLElement> = jQuery(`<div class="sf-img-detail-frame" style="max-width:${maxwidth}px"></div>`);
        this.$container = jQuery(`<div class="sf-img-detail-container"></div>`);
        $frame.append(this.$btnclose)
        $frame.append(this.$image);
        $frame.append(this.$detail);
        this.$container.append($frame);
        let $body = jQuery("body");
        $body.append(this.$container);
    }
    public squareOffset(): IOffset {
        let offset: IOffset = { width: 0, height: 0 }
        offset.width = this.$square.get(0).offsetWidth;
        offset.height = this.$square.get(0).offsetHeight;
        return offset;
    }
    public squarePosition(position: IPosition | undefined): IPosition {
        let pos: IPosition = position || { left: 0, top: 0 };
        if (position) {
            this.$square.get(0).style.left = position.left + "px";
            this.$square.get(0).style.top = position.top + "px";
        } else {
            pos = this.$square.position();
        }
        return pos;
    }
    public imageSizes(): ISizes {
        let sizes: IOffset = { width: 0, height: 0 }
        sizes.width = this.$image.width();
        sizes.height = this.$image.height();
        return sizes;
    }
    public imagePosition(): IPosition {
        return this.$image.get(0).getBoundingClientRect();
    }
    public resultOffset(): IOffset {
        let offset: IOffset = { width: 0, height: 0 }
        offset.width = this.$detail.get(0).offsetWidth;
        offset.height = this.$detail.get(0).offsetHeight;
        return offset;
    }
    public resultBackGroundPosition(left: number, top: number): void {
        this.$detail.get(0).style.backgroundPosition = `-${left}px -${top}px`;
    }
    public resultBackGroundSize(width: number, height: number): void {
        this.$detail.get(0).style.backgroundSize = `${width}px ${height}px`;
    }
    public destroy() {
        if (this.$container) {
            this.$container.empty();
            this.$container.remove();
        }
    }
}