export class CImageDetailView {
    private _$container: JQuery<HTMLElement> | null;
    public $image: JQuery<HTMLElement> | null;
    public $detail: JQuery<HTMLElement> | null;
    public $btnclose: JQuery<HTMLElement> | null;
    public $square: JQuery<HTMLElement> | null;
    constructor() {

    }
    public draw(imageUrl: string, maxwidth: number) {
        let maxheight:number=screen.height;
        this.$detail = jQuery(`<div class="sf-img-detail-result" style="background-image:url('${imageUrl}')"></div>`);
        this.$image = jQuery(`<div class="sf-img-detail-image"><img style="max-height:${maxheight}px" src="${imageUrl}"></div>`);
        this.$btnclose = jQuery(`<div class="sf-close-img-detail" data-click="img-detail-close"><span class="sf-close-img-detail-btn sf-icon-cancel "></span></div>`);
        this.$square = jQuery(`<div class="sf-img-detail-square"></div>`);
        let $frame:JQuery<HTMLElement>=jQuery(`<div class="sf-img-detail-frame" style="max-width:${maxwidth}px"></div>`);
        this._$container = jQuery(`<div class="sf-img-detail-container"></div>`);
        $frame.append(this.$btnclose)
        $frame.append(this.$image);
        $frame.append(this.$square);
        $frame.append(this.$detail);
        this._$container.append($frame);
        let $body = jQuery("body");
        $body.append(this._$container);
    }
    public destroy() {
        if (this._$container) {
            this._$container.empty();
            this._$container.remove();
        }
    }
}