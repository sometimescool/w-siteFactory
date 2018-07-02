import { IImage } from "./model";
export interface IParams {
    showCaption: boolean;
    showThumbnail: boolean;
    current: number;
}

export class CSlideView {
    private _$container: JQuery<HTMLElement>;
    private _$slide: JQuery<HTMLElement>;
    private _$thumbnails: JQuery<HTMLElement>;
    private _$thumbnailContainer: JQuery<HTMLElement>;
    private _$thumbnailsRow: JQuery<HTMLElement>;
    private _params: IParams;
    constructor(container: JQuery<HTMLElement>) {
        this._$container = container;
        this._$slide = jQuery("");
        this._$thumbnails = jQuery("");
        this._$thumbnailContainer = jQuery("");
        this._$thumbnailsRow = jQuery("");
        this._params = { showCaption: true, showThumbnail: true, current: 0 }
    }
    draw(params: IParams, data: Array<IImage>): void {
        this._$slide.empty();
        this._$thumbnails.empty();
        this._params = params;
        this._$slide = this.buildSlide(data[this._params.current], this._params.current, data.length, this._params.showCaption);
        this._$container.append(this._$slide);
        if (this._params.showThumbnail) {
            this._$thumbnails = this.buildThumbnails(this._params.current, data);
            this._$container.append(this._$thumbnails);
            let $img: JQuery<HTMLElement> = jQuery(".sf-slide-thumbnail-column", this._$thumbnailsRow);
            let imgWidth: number = $img.width() || 0;
            this._$thumbnailsRow.width((imgWidth * data.length) + data.length*2);
        }
    }
    get container(): JQuery<HTMLElement> {
        return this._$container;
    }
    private getThumbnailPosition(index: number): number {
        return jQuery(`.sf-slide-thumbnail-column[data-index="${index}"]`, this._$thumbnails).position().left
    }
    private getThumbnailWidth(index: number): number {
        return jQuery(`.sf-slide-thumbnail-column[data-index="${index}"]`, this._$thumbnails).width() || 0;
    }
    private isThumbnailVisible(index: number): boolean {
        let visible: boolean = true;
        let position: number = this.getThumbnailPosition(index);
        let width: number = this.getThumbnailWidth(index);
        if ((position < Math.abs(this.rowLeft)) ||
            (position + width) > Math.abs(this.rowLeft) + this.containerWidth) {
            visible = false;
        }
        return visible;
    }
    showThumbNail(index: number): number {
        if (this._params.showThumbnail && !this.isThumbnailVisible(index)) {
            let position: number = Math.max(this.centerThumbnail(index), 0);
            position = Math.min(position, (this.rowWidth - this.containerWidth))
            this.rowLeft = -position;
            return -position;
        }
        return this.rowLeft;
    }
    private centerThumbnail(index: number): number {
        let position: number = this.getThumbnailPosition(index);
        let width: number = this.getThumbnailWidth(index);
        position = position + (width / 2) - (this.containerWidth / 2);
        return position;
    }
    //Move left move right depending on button clicked
    moveThumbNails(moveLeft: boolean): number {
        if (!this._params.showThumbnail) return 0;
        let value: number = this.containerWidth;
        let left: number = this.rowLeft;
        let newLeft: number = 0;
        if (moveLeft) {
            if (Math.abs(left) + value + this.containerWidth > this.rowWidth) {
                value = (this.rowWidth + left - this.containerWidth)
            }
            newLeft = left - value;
        } else {
            if (left + value >= 0) {
                left = 0;
                value = 0;
            }
            newLeft = left + value;
        }
        this.rowLeft = newLeft;
        return newLeft;
    }
    refresh(data: IImage, length: number, index: number) {
        let showCaption: boolean = this._params.showCaption;
        let showThumbnail: boolean = this._params.showThumbnail;
        let img1: JQuery<HTMLElement> = jQuery("img.sf-img-slide-0", this._$slide);
        let img2: JQuery<HTMLElement> = jQuery("img.sf-img-slide-1", this._$slide);
        let current = img1;
        let next = img2
        if (img1.css("opacity") == "0") {
            current = img2;
            next = img1
        }
        next.attr("src", data.url);
        next.css("opacity", 1);
        current.css("opacity", 0);

        jQuery(".sf-numbertext", this._$slide).html(this.formatNumberText(index, length));
        if (showCaption) {
            jQuery(".sf-slide-caption", this._$slide).html(data.caption);
        }
        if (showThumbnail) {
            jQuery(".sf-slide-thumbnail-column", this._$thumbnails).removeClass("sf-current");
            jQuery(`.sf-slide-thumbnail-column[data-index="${index}"]`, this._$thumbnails).addClass("sf-current");
        }
    }
    private buildSlide(value: IImage, current: number, count: number, showCaption: boolean): JQuery<HTMLElement> {
        let el: string = `<div class="sf-slide">${this.slideContent(value, current, count, showCaption)}</div>`;
        return jQuery(el);
    }
    private formatNumberText(current: number, count: number): string {
        return `${(current + 1)}/${count}`;
    }
    private slideContent(value: IImage, current: number, count: number, showCaption: boolean | null): string {
        let el: string = `<div class="sf-img-container-slide"><img class="sf-img-slide-0" src="${value.url}">`;
        el += `<img style="opacity:0" class="sf-img-slide-1" src="${value.url}"></div>`;
        el += `<div class="sf-numbertext">${this.formatNumberText(current, count)}</div>`;
        el += `<div class="sf-slide-btn-left" data-click="slide-left" style="visibility:hidden"></div>`;
        el += `<div class="sf-slide-btn-right" data-click="slide-right" style="visibility:hidden"></div>`;
        if (showCaption) {
            el += `<div class="sf-slide-caption">${value.caption}</div>`
        }
        return el;
    }
    private buildThumbnails(current: number, data: Array<IImage>): JQuery<HTMLElement> {
        let self = this;
        let $navContainer: JQuery<HTMLElement> = jQuery('<div class="sf-thumbnail"></div>');
        $navContainer.append(this.thumbnailButtons());
        this._$thumbnailContainer = jQuery('<div class="sf-thumbnail-container"></div>');
        this._$thumbnailsRow = jQuery('<div class="sf-slide-thunbnail-row"></div>');
        data.forEach((value: IImage, index: number) => {
            self._$thumbnailsRow.append(self.buildThumbnail(value, index, current))
        })
        this._$thumbnailContainer.append(self._$thumbnailsRow);
        $navContainer.append(this._$thumbnailContainer);
        return $navContainer;
    }
    get rowWidth(): number {
        if (!this._params.showThumbnail) return 0;
        return this._$thumbnailsRow.width() || 0;
    }
    get rowLeft(): number {
        if (!this._params.showThumbnail) return 0;
        let left: number = parseFloat(this._$thumbnailsRow.css("left"));
        if (left < 0) left -= 0.01;
        return left;
    }
    set rowLeft(value: number) {
        if (this._params.showThumbnail) this._$thumbnailsRow.css("left", (value) + "px");
    }
    get containerWidth(): number {
        if (!this._params.showThumbnail) return 0;
        return this._$thumbnailContainer.width() || 0;
    }
    private buildThumbnail(image: IImage, index: number, current: number): JQuery<HTMLElement> {
        let el: string = `<div class="sf-slide-thumbnail-column ${((current == index) ? 'current' : '')}"`
        el += ` data-click="thumbnail" data-index=${index} title="${image.caption}" alt="${image.caption}"`;
        el += ` style="background-image:url(${image.url})">`;
        return jQuery(el);
    }
    private thumbnailButtons(): JQuery<HTMLElement> {
        let btns: string = '<div class="sf-thumbnail-btns">';
        btns += '<div class="sf-thumbnail-btn-left" data-click="thumbnails-left" style="visibility:hidden"><i class="sf-icon-angle-left"></i></div>';
        btns += '<div class="sf-thumbnail-btn-right" data-click="thumbnails-right" style="visibility:hidden"><i class="sf-icon-angle-right"></i></div>';
        btns += '</div>'
        return jQuery(btns);
    }
    thumbnailBtnsVisibility(left: string, right: string): void {
        if (this._params.showThumbnail) {
            jQuery(".sf-thumbnail-btn-left", this._$thumbnails).css("visibility", left);
            jQuery('.sf-thumbnail-btn-right', this._$thumbnails).css("visibility", right);
        }
    }
    slideBtnsVisibility(left: string, right: string): void {
        jQuery(".sf-slide-btn-left", this._$slide).css("visibility", left);
        jQuery('.sf-slide-btn-right', this._$slide).css("visibility", right);
    }
}