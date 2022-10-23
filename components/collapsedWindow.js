import { getAgoTime, getUrlDomin, getRandomColor } from "./utilities.js"
import { createExapndWindow } from "./expandWindow.js"

const winCollapseTemplateEle = document.getElementById('win-collapse')
const tabCollapsedTemplateEle =  winCollapseTemplateEle.content.cloneNode(true).querySelector('.win-col-tab')
tabCollapsedTemplateEle.remove()

export const createCollapsedTabEle = (tab, parentElement) =>{

    const isOpenWindow =  tab.windowId ? true : false
    const isOpenTab =  tab.id ? true : false

    const newTabEle = tabCollapsedTemplateEle.cloneNode(true)
        
    //Tab Click Event Listener
    newTabEle.addEventListener('click', (e)=>{
        e.stopPropagation()
        if (isOpenWindow){
            chrome.windows.update(tab.windowId, {focused: true}, ()=>{
                if (isOpenTab){
                    chrome.tabs.update(tab.id, {active: true})
                }
                else{
                    chrome.tabs.create({active: true, url: tab.url, windowId: tab.windowId})
                }
            })
        }
        else{
            chrome.tabs.create({active: true, url: tab.url})
        }
    })

    //Tab Title
    newTabEle.title = tab.title + '\n' + getAgoTime(tab.time)

    //Tab URL
    if (tab.favIconUrl){
        const favIconImgEle = newTabEle.querySelector('img')
        favIconImgEle.src = tab.favIconUrl
    }

    //Set Active
    if (tab.active){
        newTabEle.classList.add('active')
    }

    //Audio Dot Indicator
    if (tab.audible){
        const audioDotEle = newTabEle.querySelector('.audio-dot')
        audioDotEle.classList.add('active')
    }
    parentElement.prepend(newTabEle)
}

export const createCollapsedWindow = (window, time, isWindowActive)=>{

    // Decode Window Id and its state like opened or closed
    const windowId = window[0].windowId === undefined ? null : window[0].windowId
    const isOpenWindow =  windowId === null ? false : true
    const isOpenTabs =  window[0].id === undefined ? false : true

    //window Collapse Element
    let winCollapseEle = winCollapseTemplateEle.content.cloneNode(true)
    winCollapseEle.querySelector('.win-col-tab').remove()
    //Fix to make fragment to HTML Element
    winCollapseEle = winCollapseEle.querySelector('.win-collapse') 


    //Time
    const timeEle = winCollapseEle.querySelector('.time')
    timeEle.textContent = getAgoTime(time)

    //Active
    if (isWindowActive) winCollapseEle.classList.add('active')
    
    //Window Element Click
    const winCollapseTabCntEle = winCollapseEle.querySelector('.win-col-tab-cnt')
    winCollapseEle.addEventListener('click', (e) => {

        if (isOpenWindow){
            chrome.windows.update(windowId, {focused: true}).then(()=>{
                if (!isOpenTabs){
                    window.map((tab)=>{
                        chrome.tabs.create({active: true, url: tab.url, windowId: tab.windowId})
                    })
                }
            })

        }
        else{
            chrome.windows.create({}, (newWindow)=>{
                window.map((tab)=> chrome.tabs.create({active: true, 
                    url: tab.url, 
                    windowId: newWindow.id,
                    state: 'fullscreen'}))

            })
        }
    })

    // Close Btn
    const closeWindowBtnEle = winCollapseEle.querySelector('.close-btn')
    if (isOpenTabs){
        closeWindowBtnEle.addEventListener('click', e =>{
            e.stopPropagation()
            chrome.windows.remove(windowId)
            winCollapseEle.remove()
        })
    }
    else{
        closeWindowBtnEle.remove()
    }

    // Tabs in reverse order
    window.slice().reverse().forEach((tab)=>{
        createCollapsedTabEle(tab, winCollapseTabCntEle)
    })


    //Set data 
    winCollapseEle.dataset.windowId = windowId
    winCollapseEle.dataset.windowType = 'collapsed'

    // Expand btn to expand collapsed window
    const toExpandBtnEle = winCollapseEle.querySelector('.expand-btn')
    toExpandBtnEle.addEventListener('click', (e)=>{
        e.stopPropagation()
        const time = window[0].time
        // Newly created expanded window
        const exapndWinEle = createExapndWindow(window, time, isWindowActive)
        winCollapseEle.parentElement.insertBefore(exapndWinEle, winCollapseEle)
        winCollapseEle.remove()
        })
    return winCollapseEle
}

export const createAllCollapsedWindows = (windows, winIdsSrtByTime, activeWindowId)=>{
    //Collpased window
    const allCollapsedWindowsEle = document.createElement('div')
    allCollapsedWindowsEle.classList.add('tabs-inner-cnt')

    for (const {windowId, time} of winIdsSrtByTime){
        const  isWindowActive = windowId == activeWindowId
        
        // Creates Collapsed Window
        const collapsedWindowEle = createCollapsedWindow(windows[windowId], time, isWindowActive)
        allCollapsedWindowsEle.appendChild(collapsedWindowEle)
        
    }
    return allCollapsedWindowsEle
}