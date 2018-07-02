abstract class CDynamicHide {
    $hideElement: JQuery<HTMLElement>;
    height: number = 0;
    top: number = 0;
    display: string = "";
    constructor($element: JQuery<HTMLElement>) {
        this.$hideElement = $element;
        this.height = this.$hideElement.height() || 0;
        this.top = this.$hideElement.position().top || 0;
        this.display = this.$hideElement.css("display");
        if (this.$hideElement.css("position") == "static") {
            this.$hideElement.css("position", "relative")
        }
        this.triggerEvents();
    };
    protected triggerEvents(): void { }
}
class CDynamicHideOnScroll extends CDynamicHide {
    constructor($element: JQuery<HTMLElement>) { super($element); }
    protected triggerEvents(): void {
        super.triggerEvents();
        window.addEventListener("scroll", (e: Event) => this.scroll(), false);
    }
    private scroll(): void {
        if (document.body.scrollTop > 2 || document.documentElement.scrollTop > 2) {
            this.hide();
        } else {
            this.show();
        }
    }
    private show(): void {
        this.$hideElement.css("height", `${this.height}px`);
        this.$hideElement.css("opacity", 1);
    }
    private hide(): void {
        this.$hideElement.css("height", `0px`);
        this.$hideElement.css("opacity", 0);
    }
}
class CDynamicHideOnClick extends CDynamicHide {
    public triggerEvents(): void {
        let el: HTMLElement | null = this.$hideElement.get(0);
        if (el) {
            el.addEventListener("click", (e: Event) => this.click(e), false);
        }
    }
    private click(e: Event): void {

    }
    private show(): void {

    }
    private hide(): void {

    }
}
export function headerHide(selector?: string): void {
    let select: string = selector || ".sf-hideheader";
    let $header: JQuery<HTMLElement> = jQuery(select);
    $header.addClass("sf-hideheader");
    if ($header.length > 0) new CDynamicHideOnScroll($header);
}