import { createAllExpandWindows } from "./expandWindow.js"
import { createAllCollapsedWindows } from "./collapsedWindow.js"
import { createSingleTabEle } from "./singleTab.js"
import { handleMinMaxBtnClick as modifyMinMaxSortBtns } from "./minMaxSort.js"


//Tab Containers
const openTabCntEle =  document.getElementsByClassName('open tabs-cnt')[0]
const audioVideoTabCntEle =  document.getElementsByClassName('audio-video tabs-cnt')[0]


export const processOpenTabs = async () =>{
    let value //Place holder for locally stored object 
    
    //Get Stroed Tab Details (like time)
    value =  await chrome.storage.local.get('openTabs')
    let openTabsStored = value.openTabs

    value = await chrome.storage.local.get('openTabsViewMode')
    let openTabsViewMode = value.openTabsViewMode

    modifyMinMaxSortBtns(openTabCntEle, openTabsViewMode)

    console.log(openTabsStored, openTabsViewMode)

    //Get Tab & Window Details from chrome Browser API
    const currTabs = await chrome.tabs.query({})
    const currWindow = await chrome.windows.getCurrent({})
    const activeWindowId = currWindow.id


    // Add time property to currTabs
    const sortedAllTabs = currTabs.map((tab)=> {
        if (!openTabsStored[tab.id]) {
            console.log('Problem in BG Script - curr Tab missing in storedOpenTab')
        }
        else tab.time = openTabsStored[tab.id].time
        return tab
    })


    // sort currTabs based on time
    sortedAllTabs.sort((a,b)=>  b.time - a.time)

    // Audio & Video Tabs
    if (audioVideoTabCntEle.querySelector('.tabs-inner-cnt')){
        audioVideoTabCntEle.querySelector('.tabs-inner-cnt').remove()
    }
    const audioVideoTabEles = createaudioVideoTabs(sortedAllTabs)
    if (audioVideoTabEles.childElementCount > 0){
        audioVideoTabCntEle.style.display = 'block'
        audioVideoTabCntEle.appendChild(audioVideoTabEles)
    }



    // Create View By Table
    if (openTabsViewMode === 'T'){
        // Filter tabs
        const filteredAllTabs = sortedAllTabs.filter((tab, index)=> {
            if (tab.audible) return false
            if (index === 0) return false
            return true
        })

        // So Current tab will be the last tab
        if (!sortedAllTabs[0].audible){
            filteredAllTabs.push(sortedAllTabs[0])
        }

        // view by tab - open tabs (Note: Default Option)
        let viewByTabEles = createViewByTabsAll(filteredAllTabs)
        openTabCntEle.append(viewByTabEles)

    }
    // Create Expanded Window Elements
    else if (openTabsViewMode === 'E'){
        const [windows, winIdsSrtByTime] = processCurrTabToWindows(currTabs, activeWindowId)
        const allWindowEles = createAllExpandWindows(windows, winIdsSrtByTime, activeWindowId)
        openTabCntEle.appendChild(allWindowEles)
    }
    // Create Collapsed Window Elements openTabsViewMode is 'C'
    else {
        const [windows, winIdsSrtByTime] = processCurrTabToWindows(currTabs, activeWindowId)
        const allCollapsedWindows = createAllCollapsedWindows(windows, winIdsSrtByTime, activeWindowId)
        openTabCntEle.appendChild(allCollapsedWindows)
    }

}




const processCurrTabToWindows = (allTabs, activeWindowId) =>{
    // create a windows object out of currTabs
    const windows = {}
    allTabs.map((tab)=>{
        if (!windows[tab.windowId]) windows[tab.windowId] = []
        windows[tab.windowId].push(tab)
    })

    //Recent time of each window & sorted windowIds based on time
    const winIdsSrtByTime = []
    for (const windowId in windows){
        const window = windows[windowId]
        //Get Recent time in the window
        let time = -1
        window.forEach(tab => time = Math.max(tab.time,time))
        winIdsSrtByTime.push({windowId, time})
    }
    winIdsSrtByTime.sort((a,b)=> b.time - a.time)

    return [windows, winIdsSrtByTime]
}

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


const createaudioVideoTabs = (allTabs) =>{
    const singleTabCntEle = document.createElement('div')
    singleTabCntEle.classList.add('tabs-inner-cnt')
    for (const tab of allTabs){
        if (!tab.audible) continue
        const singleTabEle = createSingleTabEle(tab)
        singleTabCntEle.appendChild(singleTabEle)
    }
    return singleTabCntEle
}
