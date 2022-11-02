import { getAgoTime, getUrlDomin, getRandomColor } from "./utilities.js"
import { createExapndWindow } from "./expandWindow.js"
import { replaceClosedWindow } from "./processClosedTabs.js"
import { processOpenTabs, replaceOpenWindow } from "./processOpenTabs.js"
import { createbottomToastBanner } from "./bottomToastBanner.js"
import { createPopupScreen } from "./popupBox.js"

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

    //Drag and Drop feature
    if (isOpenTab){
        newTabEle.draggable = true
        //Drag Start by user
        newTabEle.addEventListener('dragstart', (e)=>{
            // newTabEle.classList.add('dragging')
            e.preventDefault()
            // Create Banner and for undo button pass a function to force 'T' view mode 
            createbottomToastBanner('View Mode Changed to Drag Tabs, Now Drag', ()=>{
                let openTabsViewMode = 'T'
                chrome.storage.local.set({openTabsViewMode}).then(()=>{
                    processOpenTabs()
                })
            })
            // Drop drag available only to View By Window mode. So, force it
            let openTabsViewMode = 'E'
            chrome.storage.local.set({openTabsViewMode}).then(()=>{
                processOpenTabs()
            })
        })

        //DragEnd by user
        // newTabEle.addEventListener('dragend', e=>{
        //     newTabEle.classList.remove('dragging')
        // })
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
        if (isOpenWindow && isOpenTabs){
            chrome.windows.update(windowId, {focused: true})
        }
        else if(isOpenWindow && !isOpenTabs){
            const handleWindowClick = ()=> {
                chrome.windows.update(windowId, {focused: true}).then(()=>{
                   window.map((tab)=>{
                       chrome.tabs.create({active: true, url: tab.url, windowId: tab.windowId})
                   })
               })
            }
            if (window.length>1){
                createPopupScreen(`About to open ${window.length} tabs`, 'Do you want to proceed?',handleWindowClick)
            }
            else handleWindowClick()
        }
        else{
            const handleWindowClick = ()=>{
                chrome.windows.create({state: 'maximized', 
                        url: window[0].url, focused: true}, (newWindow)=>{
                        window.map((tab, index)=> {
                        if (index === 0) return
                        chrome.tabs.create({active: true, 
                        url: tab.url, 
                        windowId: newWindow.id})
                    })
                })
            }
            if (window.length>3){
                createPopupScreen(`About to open ${window.length} tabs`, 'Do you want to proceed?',handleWindowClick)
            }
            else{
                handleWindowClick()
            }
        }
    })

    // Close Btn
    const closeWindowBtnEle = winCollapseEle.querySelector('.close-btn')
    if (isOpenTabs){
        closeWindowBtnEle.addEventListener('click', e =>{   
            e.stopPropagation()
            const handleCloseBtnClick = ()=>{
                chrome.windows.remove(windowId).then(()=>{
                    createbottomToastBanner('Window Closed Sucessfully',()=>{
                        chrome.windows.create({state: 'maximized', 
                                                url: window[0].url, focused: true}, (newWindow)=>{
                            window.map((tab, index)=> {
                                if (index === 0) return
                                chrome.tabs.create({active: true, 
                                    url: tab.url, 
                                    windowId: newWindow.id})
                            })
            
                        })
                    })
                })
                winCollapseEle.remove()
            }
            if (window.length>3){
                createPopupScreen(`About to Close ${window.length} tabs`, 'Do you want to proceed?',handleCloseBtnClick)
            }
            else{

                handleCloseBtnClick()
            }

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
    toExpandBtnEle.addEventListener('click', async (e)=>{
        e.stopPropagation()
        if (isOpenTabs){
            replaceOpenWindow(windowId, isWindowActive, winCollapseEle, 'E')
        }
        else if (isOpenWindow){
            replaceClosedWindow(windowId, isWindowActive, winCollapseEle, 'E')

        }
        else{
            const time = window[0].time
            // Newly created expanded window
            const exapndWinEle = createExapndWindow(window, time, isWindowActive)
            winCollapseEle.parentElement.insertBefore(exapndWinEle, winCollapseEle)
            winCollapseEle.remove()
        }
    })
    //Drag feature
    // const getTabAfterDraggingTab = (winCollapseEle, clientXY)=>{
    //     const [clientX, clientY] = clientXY
    //     let notDraggingTabEles = [...winCollapseEle.querySelectorAll('.win-col-tab:not(.dragging)')];
        
    //     return windowTabEles.reduce((closestTab, nextTab)=>{
    //         let nextTabRect = nextTab.getBoundingClientRect()
    //         let offSetX = clientX - nextTabRect.left - (nextTabRect.width/2) 
    //         // let offSetX = clientX - nextTabRect.right

    //         if ((offSetX < 0 && offSetX > closestTab.offSetX) &&
    //             (clientY >= nextTabRect.top && clientY <= nextTabRect.bottom)){
    //             return {offSetX, element: nextTab}
    //         }
    //         else return closestTab
    //     }, {offSetX: Number.NEGATIVE_INFINITY}).element
    // }
    // if (isOpenTabs){
    //     winCollapseTabCntEle.addEventListener('dragover', (e)=>{
    //         e.preventDefault()
    //         let draggingTab = document.querySelector('.dragging')
    //         let tabAfterDraggingTab = getTabAfterDraggingTab(winCollapseEle, [e.clientX, e.clientY])
    //         if(tabAfterDraggingTab){
    //             winCollapseTabCntEle.insertBefore(draggingTab, tabAfterDraggingTab);

    //         }
    //         else{
    //             winCollapseTabCntEle.appendChild(draggingTab);

    //         }
    //     })
    // }
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