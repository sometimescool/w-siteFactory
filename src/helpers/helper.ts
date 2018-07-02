export interface ISplitedKey {
    year: number;
    month: number; //0:janvier
    day: number;
}
export interface ISplited1Key {
    month: string; //aaaa-mm,janvier: 01
    day: string; //jj
}
export class CDom {
    static dataClick(el: HTMLElement): string | null {
        let value: string | null = null;
        value = el.getAttribute("data-click");
        return value;
    }
    static clickHandler(el: HTMLElement): HTMLElement {
        let elmt: HTMLElement | null = el;
        while (elmt != null && !CDom.dataClick(elmt)) {
            elmt = elmt.parentElement;
        }
        return elmt as HTMLElement;
    }
}
export class CString {
    static repeat(stringToRepeat: string, count: number) {
        let AString: Array<string> = [];
        let nRep = 0;
        while (nRep < count) {
            AString.push(stringToRepeat)
        }
        return AString.join("");
    }
    static padStart(stringToPad: string, targetLength: number, padString?: string): string {
        targetLength = targetLength >> 0; //truncate if number or convert non-number to 0;
        padString = String((typeof padString !== 'undefined' ? padString : ' '));
        if (stringToPad.length > targetLength) {
            return String(stringToPad);
        }
        else {
            targetLength = targetLength - stringToPad.length;
            if (targetLength > padString.length) {
                padString += CString.repeat(padString, targetLength / padString.length); //append to original to ensure we are longer than needed
            }
            return padString.slice(0, targetLength) + String(stringToPad);
        }
    }
    static split1Date(stringDate: string): ISplited1Key {
        let keys: Array<string> = stringDate.split("-");
        let splittedKey: ISplited1Key = { "month": "", "day": "" };
        if (keys.length == 3) {
            splittedKey.month = keys[0] + "-" + keys[1];
            splittedKey.day = keys[2]
        } else {
            throw new Error("Error String.split1Date format (nnnn-nn-nn): value " + stringDate)
        }
        return splittedKey;
    }
    static splitDate(stringDate: string): ISplitedKey {
        let keys: Array<string> = stringDate.split("-");
        let splittedKey: ISplitedKey = { "year": 0, "month": 0, "day": 0 };
        if (keys.length == 3) {
            splittedKey.year = parseInt(keys[0], 10);
            splittedKey.month = parseInt(keys[1], 10) - 1;
            splittedKey.day = parseInt(keys[2], 10);
        } else {
            throw new Error("Error String.splitDate format (nnnn-nn-nn): value " + stringDate)
        }
        return splittedKey;
    }
}
export class CDate {
    /**
     * @param date type Date
     * @return  AAAA-MM-JJ
     */
    static getKey(date: Date): string {
        let sMonth: string = CString.padStart((date.getMonth() + 1) + "", 2, "0");
        let sDay: string = CString.padStart((date.getDate() + ""), 2, "0");
        return date.getFullYear() + "-" + sMonth + "-" + sDay;
    }
    /**
     * @param date type Date
     * @return day with monday as start week
     */
    static getFrenchDay(date: Date): number {
        let day: number = date.getDay();
        let frenchDay: number = (day == 0) ? 7 : day;
        frenchDay--;
        return frenchDay;
    }
    /**
     * @param date type Date
     * @return the day of the first date of the month
     */
    static getFrenchFirstDay(date: Date): number {
        let firstDate: Date = new Date(date.getFullYear(), date.getMonth(), 1, 4);
        return CDate.getFrenchDay(firstDate);
    }
    /**
     * @param date type Date
     * @return  the week position in the month
     */
    static getFrenchWeekInMonth(date: Date): number {
        let numWeek: number = 0;
        return Math.floor((date.getDate() + CDate.getFrenchFirstDay(date) - 1) / 7);
    }
}