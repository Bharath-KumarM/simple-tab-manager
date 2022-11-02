import { getAgoTime, getRandomColor, getUrlDomin } from "./utilities.js"
import { createCollapsedWindow } from "./collapsedWindow.js"
import { createNewCloseTabEle, replaceClosedWindow } from "./processClosedTabs.js"
import { replaceOpenWindow } from "./processOpenTabs.js"
import { createbottomToastBanner } from "./bottomToastBanner.js"
//Template
const winExpandTemplateEle = document.getElementById('win-expand')



export const createExapndWindow = (window, time, isWindowActive)=>{

    // Decode Window Id and whether it is opened or closed
    const windowId = window[0].windowId
    const isOpenWindow =  windowId ? true : false
    const isOpenTabs =  window[0].id  ? true : false

    //Expand window element
    let winExpandEle = winExpandTemplateEle.content.cloneNode(true)
    winExpandEle = winExpandEle.querySelector('.win-expand')
    
    //Time desc
    const windowTimeEle = winExpandEle.querySelector('.time')
    windowTimeEle.textContent = getAgoTime(time)

    //Single tab template Element
    const singleTabTempEle = winExpandEle.querySelector('.single-tab')
    singleTabTempEle.remove()
    
    //Stripe
    const stripeEle = winExpandEle.querySelector('.stripe')
    const stripeColor = getRandomColor()
    
    //Create single tabs for window
    window.map((tab)=>{
        let singleTabEle = singleTabTempEle.cloneNode(true)
        
        // fav icon
        const favIconEle = singleTabEle.querySelector('.fav-icon')
        if (tab.favIconUrl) favIconEle.setAttribute('src', tab.favIconUrl)
    
        // title
        const titleEle = singleTabEle.querySelector('.title span')
        titleEle.textContent = tab.title

        //Stripe
        const stripeEle = singleTabEle.querySelector('.stripe')
        stripeEle.style.backgroundColor = stripeColor

        // url & time
        const titleSubEle = singleTabEle.querySelector('.title-sub')
        const urlEle = titleSubEle.getElementsByTagName('span')[0]
        urlEle.textContent = getUrlDomin(tab.url) + ' • '
        const timeEle = titleSubEle.getElementsByTagName('span')[1]
        timeEle.textContent = ''
        if (tab.time){
            timeEle.textContent = ' ' + getAgoTime(tab.time)
            
        }
        else if (openTabsStored[tab.id]){
            const storedTab = openTabsStored[tab.id]
            timeEle.textContent = ' ' + getAgoTime(storedTab.time)
        }
        else console.log(tab)

        //Audio Dot indicator
        if (tab.audible){
            const audioDotEle = singleTabEle.querySelector('.audio-dot')
            audioDotEle.classList.add('active')
        }

        //Active
        if (tab.active) singleTabEle.classList.add('active')

        // Add Element to DOM
        winExpandEle.append(singleTabEle)
        singleTabEle = winExpandEle.lastElementChild

 
        // Tab Click
        singleTabEle.addEventListener('click', (e)=>{
            e.stopPropagation()
            if (isOpenWindow){
                chrome.windows.update(tab.windowId, {focused: true}, 
                    ()=>{
                        if (isOpenTabs)
                            chrome.tabs.update(tab.id, {active: true})
                        else 
                            chrome.tabs.create({active: true, url: tab.url, windowId: tab.windowId})
                    })
            }
            else{
                chrome.tabs.create({active: true, url: tab.url})
            }
        })

        // Close Btn
        const closeTabBtnEle = singleTabEle.querySelector('.close-btn')
        if (isOpenTabs){
            closeTabBtnEle.addEventListener('click', (e)=>{
                e.stopPropagation()
                // filter the window object to reflect the changes while creating the collapsed winowd
                window = window.filter((filterTab)=>filterTab.id !== tab.id)

                chrome.tabs.remove(tab.id).then(()=>{
                    // Bottom Toast Banner, undo btn function
                    createbottomToastBanner('Tab Closed Successfully', ()=>{
                        chrome.windows.get(tab.windowId).then(()=>chrome.tabs.create({windowId: tab.windowId, 
                                                                                        active: true, 
                                                                                        url: tab.url}))
                            .catch(() =>  chrome.tabs.create({active: true, url: tab.url}))
                    })
                }).catch(()=> createbottomToastBanner('Tab Close UnSuccessfully! Refresh Once'))
                singleTabEle.remove()
                delete tab.id
                createNewCloseTabEle(tab)
            })
        }
        else{
            closeTabBtnEle.remove()
        }

        // Add tabId and windowId data to elements
        singleTabEle.dataset.tabId = tab.id
        singleTabEle.dataset.windowId = tab.windowId
        singleTabEle.draggable = true

        if (isOpenTabs){
            //Drag start by user
            singleTabEle.addEventListener('dragstart', (e)=>{
                singleTabEle.classList.add('dragging')
            })
            //Drag end by user refresh windows involved in drag
            singleTabEle.addEventListener('dragend', (e)=>{
                const openTabsCntEle = document.querySelector('.open .tabs-inner-cnt')
                document.querySelector('.dragging').classList.remove('dragging')
                //Dropped Tab info
                const droppedTabEle = openTabsCntEle.querySelector(`[data-tab-id="${tab.id}"]`)
                const droppedWindowEle = droppedTabEle.parentElement
                const droppedWindowId = parseInt(droppedWindowEle.dataset.windowId)
                const droppedPosition = Array.prototype.indexOf.call(droppedWindowEle.children, droppedTabEle)
                
                //Dragged Tab info
                const draggedWindowId = parseInt(droppedTabEle.dataset.windowId)
                const draggedWindowEle = openTabsCntEle.querySelector(`[data-window-id="${draggedWindowId}"]`)
                const isDragDropWindowSame = draggedWindowId === droppedWindowId

                //Move tab accordingly, update window element and send message to user
                chrome.tabs.move(tab.id, {index: droppedPosition-1, windowId:droppedWindowId}).then(()=>{
                    replaceOpenWindow(droppedWindowId, false, droppedWindowEle, 'E').then(()=>{
                        createbottomToastBanner('Tab Moved Successfully')
                    })
                    //when drag and drop tabs are from the same window, don't need to update twice.
                    if (isDragDropWindowSame) return
                    replaceOpenWindow(draggedWindowId, false, draggedWindowEle, 'E').then(()=>{
                        createbottomToastBanner('Tab Moved Successfully')
                    })
                })
    
            }) 
        }
    })
    const getTabAfterDraggingTab = (windowEle, yDraggingTab)=>{
        console.log(yDraggingTab)
        //Get all single tab elements of the window execpt the dragging tab
        let windowTabs = [...windowEle.querySelectorAll('.single-tab:not(.dragging)')];
        return windowTabs.reduce((closestTab, nextTab)=>{
            let nextTabRect = nextTab.getBoundingClientRect();
            // let offset = yDraggingTab - nextTabRect.top - nextTabRect.height /2;
            let offset = yDraggingTab - nextTabRect.top - (nextTabRect.height /2);
    
            if(offset < 0 && offset > closestTab.offset){
                return {offset, element: nextTab}
            } else{
                return closestTab;
            }
        
        }, {offset: Number.NEGATIVE_INFINITY}).element;
    
    }
    if (isOpenTabs){
        winExpandEle.addEventListener('dragover', (e)=>{
            e.preventDefault()
            let draggingTab = document.querySelector('.dragging');
            let tabAfterDraggingTab = getTabAfterDraggingTab(winExpandEle, e.clientY);
            if(tabAfterDraggingTab){
                    tabAfterDraggingTab.parentNode.insertBefore(draggingTab, tabAfterDraggingTab);

            } else{
                console.log('append child')
                winExpandEle.appendChild(draggingTab);
            }
    
        })
    }

    const toMinimizeBtn = winExpandEle.querySelector('.minimize')
    toMinimizeBtn.addEventListener('click', async (e)=>{
        e.stopPropagation()
        if(isOpenTabs){
            replaceOpenWindow(windowId, isWindowActive, winExpandEle, 'C')
        }
        else if (isOpenWindow){
            replaceClosedWindow(windowId, isWindowActive,winExpandEle, 'C' )
        }
        else{

            const exapndWinEle = createCollapsedWindow(window, time, isWindowActive)
            winExpandEle.parentElement.insertBefore(exapndWinEle, winExpandEle)
            winExpandEle.remove()
        }
    })

    if (isOpenWindow){
        winExpandEle.dataset.windowId = windowId
    }
    return winExpandEle

}

export const createAllExpandWindows = (windows, winIdsSrtByTime, activeWindowId)=>{
    const allExpandWindowsEle = document.createElement('div')
    allExpandWindowsEle.classList.add('tabs-inner-cnt')
    for (const {windowId, time} of winIdsSrtByTime){
        const  isWindowActive = windowId == activeWindowId
        // Creates Expand Window
        const expandWindowEle = createExapndWindow(windows[windowId], time, isWindowActive)
        allExpandWindowsEle.appendChild(expandWindowEle)
    }
    return allExpandWindowsEle
}