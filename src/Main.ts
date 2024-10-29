import * as Plugin from "iitcpluginkit"
import {Checker} from "./PolyChecker"
import Link = IITC.Link;

class MachinaInPoly implements Plugin.Class {
    private readonly checker: Checker = new Checker()
    private readonly drawTool = window.plugin.drawTools
    private enabled: boolean = false
    private activated: boolean = false
    private originalOpacity: number
    private machinaLinks: Link[] = []

    addButton() {
        IITC.toolbox.addButton(
            {
                label: "Toggle Machina link outside poly",
                action: () => this.buttonClicked(),
            }
        )
    }

    addPolygonData() {
        if (!this.drawTool) {
            alert("DrawTools are required")
            return
        }
        this.drawTool.drawnItems.eachLayer((layer: {
                getLatLngs: () => { lat: number, lng: number }[]
            }) => {
                this.checker.addPoly(layer.getLatLngs())
            }
        )
    }

    checkerInitialize() {
        this.checker.clear()
    }

    filterLinks() {
        return this.machinaLinks.filter((link) => this.checker.checkLocation(link.options.data))
    }

    setLinkStyle(link: Link, opacity: number) {
        link.setStyle({
            opacity: opacity,
        })
    }

    hideMachinaLink(include: Link[]) {
        const guids = new Map<string, boolean>(include.map(link => [link.options.guid, true]));
        this.machinaLinks.forEach(link => {
            if (!guids.get(link.options.guid)) {
                this.setLinkStyle(link, 0)
            }
        })
    }

    resetLinks() {
        this.machinaLinks.forEach(link => {
            this.setLinkStyle(link, this.originalOpacity)
        })
    }

    buttonClicked() {
        if (!this.activated) return
        this.checkerInitialize()
        if (this.enabled) {
            this.resetLinks()
            this.enabled = false
        } else {
            this.addPolygonData()
            this.hideMachinaLink(this.filterLinks())
            this.enabled = true
        }
    }

    init() {
        console.log("MachinaInPoly " + VERSION)
        this.addButton()
        window.addHook("requestFinished",()=>{
            if (!this.activated) {
                this.originalOpacity = this.machinaLinks.filter((link) => link.options?.opacity)[0].options.opacity ?? 1
                this.activated = true
            }
        })
        window.addHook("linkAdded", () => {
            this.machinaLinks = Object.values(window.links).filter((link) => link.options?.data?.team === "M")
            if (this.enabled) {
                this.hideMachinaLink(this.filterLinks())
            }
        })
        // window.addHook("paneChanged", () => {
        //     if (this.enabled) this.buttonClicked()
        //     this.activated = false
        // })
    }
}

/**
 * use "main" to access you main class from everywhere
 * (same as window.plugin.MachinaInPoly)
 */
export const main = new MachinaInPoly()
Plugin.Register(main, "MachinaInPoly")

