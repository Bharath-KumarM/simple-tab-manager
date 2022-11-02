import { createSingleTabEle } from "./singleTab.js"
import { handleMinMaxBtnClick as modifyMinMaxSortBtns } from "./minMaxSort.js"
import { createExapndWindow } from "./expandWindow.js"
import { createCollapsedTabEle, createCollapsedWindow } from "./collapsedWindow.js"

const closeTabCntEle =  document.getElementsByClassName('close tabs-cnt')[0]

const createViewByTabsAll = (allTabs)=>{
    const tempTabCntEle = document.createElement('div')
    tempTabCntEle.classList.add('tabs-inner-cnt')

    for (const index in allTabs){
        const tab = allTabs[index]
        //Create Sigle tabs
        const singleTabEle = createSingleTabEle(tab)

        //Active class is only for first open tab
        if (tab.id && index == 0){
            singleTabEle.classList.add('active')
        }
        tempTabCntEle.appendChild(singleTabEle)
    }

    return tempTabCntEle
}

export const processClosedTabs = async () =>{
    let closedTabsOfOpenWin = chrome.storage.local.get('CTofOW')
    let closedTabsOfClosedWin = chrome.storage.local.get('CTofCW')

    let value //Place holder for locally stored object 

    //Get Tab View Mode from local storage
    value = await chrome.storage.local.get('closeTabsViewMode')
    let closeTabsViewMode = value.closeTabsViewMode
    if (!closeTabsViewMode){
        closeTabsViewMode = 'T'
            chrome.storage.local.set({closeTabsViewMode})
    }
    modifyMinMaxSortBtns(closeTabCntEle, closeTabsViewMode)


    closedTabsOfOpenWin = await closedTabsOfOpenWin
    closedTabsOfClosedWin = await closedTabsOfClosedWin

    // Re-initialize Objects if not available
    if (!closedTabsOfOpenWin.CTofOW) closedTabsOfOpenWin = {}
    else closedTabsOfOpenWin = closedTabsOfOpenWin.CTofOW

    if (!closedTabsOfClosedWin.CTofCW) closedTabsOfClosedWin = []
    else closedTabsOfClosedWin = closedTabsOfClosedWin.CTofCW
    
    if (closeTabsViewMode === 'T'){
        
        // Create an Array of closed tabs
        let allClosedTabs = []
        for(const windowId in closedTabsOfOpenWin){
            allClosedTabs = allClosedTabs.concat(closedTabsOfOpenWin[windowId])
        }
    
        for (const CTofCW of closedTabsOfClosedWin){
            for (const CTCWtab of CTofCW){
                allClosedTabs.push(CTCWtab)
            }
        }
        
        // sort the Array of closed tabs
        allClosedTabs.sort((a,b)=>  b.time - a.time)
    
        // Remove old Duplicate url tabs 
        const uniqueClosedTabs = []
        for (let i=allClosedTabs.length-1; i>-1; i--){
            let didFindDuplicateUrl = false
            for (let j=i-1; j>-1; j--){
                if (allClosedTabs[i].url === allClosedTabs[j].url){
                    didFindDuplicateUrl = true
                    break
                }
            }
            if (!didFindDuplicateUrl){
                uniqueClosedTabs.push(allClosedTabs[i])
            }
    
        }
        uniqueClosedTabs.reverse()
    
        // view by tab & single tabs 
        let viewByTabEles = createViewByTabsAll(uniqueClosedTabs)
        closeTabCntEle.append(viewByTabEles)
    }
    else{

        // view by window logic starts
        //Recent time of each window & sorted windowIds based on time
        let allClosedwinSrtByTime = []
        for (const windowId in closedTabsOfOpenWin){
            closedTabsOfOpenWin[windowId].reverse()
            allClosedwinSrtByTime.push(closedTabsOfOpenWin[windowId])
        }
    
        for (const window of closedTabsOfClosedWin){
            window.reverse()
            allClosedwinSrtByTime.push(window)
        }
        // [+] have to debug
        allClosedwinSrtByTime = allClosedwinSrtByTime.filter((window)=>{
            if (window[0] && window[0].time) return true
            else console.log(window)
        })

        allClosedwinSrtByTime.sort((a,b)=> b[0].time - a[0].time)

        if (closeTabsViewMode === 'C'){
        
            //Collpased window
            const allCollapsedWindowsEle = document.createElement('div')
            allCollapsedWindowsEle.classList.add('tabs-inner-cnt')
            for (const window of allClosedwinSrtByTime){     
                // Creates Collapsed Window
                const collapsedWindowEle = createCollapsedWindow(window, window[0].time, false)
                allCollapsedWindowsEle.appendChild(collapsedWindowEle)
            }
            closeTabCntEle.appendChild(allCollapsedWindowsEle)
        }
        else {
            //Expanded window
            const allExpandedWindowsEle = document.createElement('div')
            allExpandedWindowsEle.classList.add('tabs-inner-cnt')
            for (const window of allClosedwinSrtByTime){     
                // Creates Collapsed Window
                const expandedWindowEle = createExapndWindow(window, window[0].time, false)
                allExpandedWindowsEle.appendChild(expandedWindowEle)
            }
            closeTabCntEle.appendChild(allExpandedWindowsEle)
        }
    }
}

export const replaceClosedWindow = async (windowId, isWindowActive, replaceEle, replaceByEleViewMode )=>{
    let closedTabsOfOpenWin = await chrome.storage.local.get('CTofOW')
    closedTabsOfOpenWin = closedTabsOfOpenWin.CTofOW
    const updatedWindow = closedTabsOfOpenWin[windowId].reverse()
    let time = updatedWindow[0].time
    // Newly created expanded window
    const replaceByEle = replaceByEleViewMode === 'E' ? 
            createExapndWindow(updatedWindow, time, isWindowActive) :
            createCollapsedWindow(updatedWindow, time, isWindowActive)
    replaceEle.parentElement.insertBefore(replaceByEle, replaceEle)
    replaceEle.remove()
}
export const createNewCloseTabEle = (tab)=>{
    // closed window element 
    const closedWindowEle = closeTabCntEle.querySelector(`[data-window-id="${tab.windowId}"]`)
    if (closedWindowEle && closedWindowEle.dataset.windowType === 'collapsed'){
        const closedWindowTabCnt = closedWindowEle.querySelector('.win-col-tab-cnt')
        createCollapsedTabEle(tab, closedWindowTabCnt)
    }
    else{
        const closeTabsInnerCnt = closeTabCntEle.querySelector('.tabs-inner-cnt')
        const closedTabEle = createSingleTabEle(tab)
        closeTabsInnerCnt.prepend(closedTabEle)
    }
}