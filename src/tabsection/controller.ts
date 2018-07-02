import { CDom } from "../helpers/helper";
/**
 * params{
 *  scrollTop:boolean,
 *  close : boolean
 * }
 */
abstract class CLinkSection {
    $sectionList: JQuery<HTMLElement>;
    $container: JQuery<HTMLElement>;
    constructor(params: any, classCss: string) {
        this.$sectionList = jQuery(`.${classCss}`);
        this.$container = jQuery(`<div class="${classCss}-tabs"></div>`);
    }
    get list(): JQuery<HTMLElement> {
        return this.$sectionList;
    }
    get container(): JQuery<HTMLElement> {
        return this.$container;
    }
    protected triggerEvents(): void {
        this.container.get(0).addEventListener("click", (e: Event) => this.click(e), false);
    }
    private click(e: Event): void {
        let el: HTMLElement = e.target as HTMLElement;
        el = CDom.clickHandler(el);
        if (el) this.doClick(el)
    }
    protected doClick(el: HTMLElement): void {
        if (CDom.dataClick(el) === "tab")
            this.clickTab(jQuery(el).data("index"));
    }
    private clickTab(sindex: string): void {
        let index: number = parseInt(sindex, 10) || 0;
        let $el: JQuery<HTMLElement> = jQuery(this.list[index]);
        let delatPaddingMargin:number=parseInt($el.css("margin-top"),10)+parseInt($el.css("padding-top"),10)
        let position: any = $el.offset();
        let delta: number = (((this.container && this.container.height()) || 0) + 6);
        this.scrollTo(position.top - delta + delatPaddingMargin  -2)
    }
    protected scrollTo(position:number):void{
        jQuery("body, html").animate({scrollTop:position},700)
    }
}
class CPanelSection extends CLinkSection {
    panelClosed: boolean = false; /* fermeture explicite utilisateur*/;
    buttonSize: number = 30;
    linkSizeMin: number = 90;
    top: number = 0;
    constructor(params: any,classCss:string="sf-panel") {
        super(params,classCss);        
        if (this.$sectionList.length >= 1) {
            jQuery(document.body).append(this.container);
            let par = this.getParams(params);
            this.linkSizeMin = par.minSize;
            let $tabs: JQuery<HTMLElement> = this.buildTabs(classCss, par);
            this.container.append($tabs);
            this.top = (((this.container && this.container.height()) || 0) + 6);
            let padding: number = this.paddingRight($tabs,par.scrollTop,par.close);
            $tabs.css("padding-right", `${padding}px`);
            this.triggerEvents();
        }
        this.scroll()
    }
    private buildTabs(selector: string,params?: any): JQuery<HTMLElement> {
        let content: string = "";
        let captions: any = this.widths();
        let lastIndex: number = 0;
        let buttonStyle:string="";
        if(this.buttonSize) 
            buttonStyle=`style="width:${this.buttonSize}px" `
        this.list.each((index, el) => {
            let caption:string=this.caption(el);
            content += this.link(selector,caption,index,captions);
            lastIndex = index;
        })
        if (params.scrollTop) {
            lastIndex++;
            content += `<li class="${selector}-tab sf-btn-panel" ${buttonStyle} data-click="scrollTop"><span style="width:${this.buttonSize}px" class="sf-tab-scrollTop sf-icon-up-circled"></span></li>`
        }
        if (params.close) {
            lastIndex++;
            content += `<li class="${selector}-tab sf-btn-panel" ${buttonStyle} data-click="close"><span style="width:${this.buttonSize}px" class="sf-tab-close sf-icon-cancel-circled"></span></li>`
        }
        let tabs: string = `<div class="${selector}-tabs-panel"><ul class="sf-tabs">${content}</ul></div>`;
        return jQuery(tabs)
    }
    private link(selector:string,caption:string,index:number,captions:any):string{
        let link:string="";
        let styleli:string="";
        let stylespan:string="";
        styleli=`style="width:${(captions.width[index]) * 100 / captions.total}%"`;
        stylespan=`style="width:${captions.width[index]}px"`;
        link= `<li class="${selector}-tab" ${styleli} data-click="tab" data-index="${index}"><span ${stylespan} class="sf-tab-text">${caption}</span></li>`
        return link;
    }
    private getParams(params: any): any {
        let pars: any = { scrollTop: false, close: false, minSize: this.linkSizeMin,css:"" };
        if (params) {
            pars.scrollTop = params ? params.scrollTop : false;
            pars.close = params ? params.close : false;
            pars.minSize = params.minSize ? params.minSize : this.linkSizeMin;
        }
        return pars;
    }
    protected triggerEvents() {
        super.triggerEvents();
        window.addEventListener("scroll", (e: Event) => this.scroll(), false);
    }
    protected doClick(el: HTMLElement): void {
        super.doClick(el);
        switch (CDom.dataClick(el)) {
            case "close":
                this.panelClosed = true;
                this.hide();
                break;
            case "scrollTop":
                this.scrollTo(0);
                break;
        }
    }
    private caption(el:HTMLElement):string{
        let $el: JQuery<HTMLElement> = jQuery(el);
        let caption: string = $el.data("params") ? ($el.data("params").caption || $el.text()) : $el.text();
        return caption;
    }
    private scroll() {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            if (!this.panelClosed) this.show();
        } else {
            this.panelClosed = false;
            this.hide();
        }
    }
    private widths(): any {
        let captions: any = { "width": [], "total": 0 }
        this.list.each((index, el) => {
            let $el: JQuery<HTMLElement> = jQuery(el);
            let caption: string = $el.data("params") ? ($el.data("params").caption || $el.text()) : $el.text();
            captions.width.push(this.captionSize(caption));
            captions.total += captions.width[index];
        })
        return captions
    }
    private paddingRight($tabs:JQuery<HTMLElement>,scrollTop:boolean,close:boolean):number{
        let padding: number = (parseInt($tabs.css("padding-left"), 10) + this.$sectionList.length - 1);
        if (scrollTop)
            padding += this.buttonSize + 1;
        if (close)
            padding += this.buttonSize + 1;
        return padding;
    }
    private captionSize(caption: string): number {
        let $el: JQuery<HTMLElement> = jQuery(`<span id="sf-sizing"style="width:auto;box-sizing: border-box;" class="sf-tab-text">${caption}</span>`);
        jQuery(document.body).append($el);
        let size: number = Math.max(($el.width() || 0) + 2, this.linkSizeMin);
        $el.remove();
        return size;
    }
    private hide(): void {
        if(this.container.position().top >=0)
            this.container.get(0).style.top = `-${this.top}px`
    }
    private show(): void {
        if(this.container.position().top < 0)
            this.container.get(0).style.top = `0px`
    }
}
class CQuickLinks extends CLinkSection {
    constructor(container:string,params: any,classCss:string="sf-link",) {
        super(params, classCss);
        if (this.$sectionList.length >= 1) {
            let $tabs: JQuery<HTMLElement> = this.buildTabs(classCss,params);
            this.container.append($tabs);
            this.triggerEvents();
        }
        jQuery(document.body).append(this.container);
        let $linksContainer=jQuery(container);
        if($linksContainer.length>0){
            $linksContainer.css("position","relative");
            $linksContainer.append(this.container);
        }else{

        }
    }
    private buildTabs(selector: string,params: any): JQuery<HTMLElement> {
        let content: string = "";
        let lastIndex: number = 0;
        this.list.each((index, el) => {
            let caption:string=this.caption(el);

            content += this.link(selector,caption,index,this.highlight(el));
            lastIndex = index;
        })
        let tabs: string = `<div class="${selector}-tabs-panel"><ul class="sf-tabs">${content}</ul></div>`;
        return jQuery(tabs)
    }
    private link(selector:string,caption:string,index:number,highlight:boolean):string{
        let link:string="";
        let additionalCss:string=highlight?" sf-highlight":"";
        link= `<li class="${selector}-tab" data-click="tab" data-index="${index}"><span class="sf-tab-text${additionalCss}">${caption}<span class="sf-icon-level-down"></span></span></li>`
        return link;
    }
    private caption(el:HTMLElement):string{
        let $el: JQuery<HTMLElement> = jQuery(el);
        let caption: string = $el.data("params") ? ($el.data("params").captionLink || $el.text()) : $el.text();
        return caption;
    }
    private highlight(el:HTMLElement):boolean{
        let $el: JQuery<HTMLElement> = jQuery(el);
        let highlight: boolean = $el.data("params") ? $el.data("params").highlight : false;
        return highlight;
    }
}
export function panelSectionFactory(params: any): void {
    let tabS: CPanelSection = new CPanelSection(params);
}
export function linkSectionFactory(container:string,params: any): void {
    let containerSelector:string=container || ".sf-linksContainer";
    let position:string=params.position.split(",").join("-");
    let links: CQuickLinks = new CQuickLinks(container,params);
    links.container.addClass(`sf-${position}`)
}