//Tab Containers
const openTabCntEle =  document.getElementsByClassName('open tabs-cnt')[0]
const audioVideoTabCntEle =  document.getElementsByClassName('audio-video tabs-cnt')[0]
const closeTabCntEle =  document.getElementsByClassName('close tabs-cnt')[0]

//Template
const singleTabTemplateEle = document.getElementById('single-tab')
const winCollapseTemplateEle = document.getElementById('win-collapse')
const winExpandTemplateEle = document.getElementById('win-expand')
const tabCollapsedTemplateEle =  winCollapseTemplateEle.content.cloneNode(true).querySelector('.win-col-tab')
tabCollapsedTemplateEle.remove()





const getAgoTime = (time)=>{
    if (isNaN(time)) return 'A while ago!'

    // Calculate milliseconds in a year
    const date = new Date()
    const timeDiffer = date.getTime() - time
    const minute = 1000 * 60;
    const hour = minute * 60;
    const day = hour * 24;
    const year = day * 365;

    
    if (Math.round(timeDiffer/1000) < 60) 
        return  `${Math.round(timeDiffer/1000)} secs ago`
    if (Math.round(timeDiffer/minute) < 60) 
        return  `${Math.round(timeDiffer/minute) } mins ago`
    if (Math.round(timeDiffer/hour) < 24) 
        return  `${Math.round(timeDiffer/hour)} hrs ago`
    return  `${Math.round(timeDiffer/day)} days ago`
}

const getUrlDomin = (givenUrl)=>{
    let url = new URL(givenUrl)
    return url.hostname

}

const getRandomColor = () =>{
    let maxVal = 0xFFFFFF; // 16777215
    let randomNumber = Math.random() * maxVal; 
    randomNumber = Math.floor(randomNumber);
    randomNumber = randomNumber.toString(16);
    let randColor = randomNumber.padStart(6, 0);   
    return `#${randColor.toUpperCase()}`
}

const createNewCloseTabEle = (tab)=>{
    // closed window element 
    const closedWindowEle = closeTabCntEle.querySelector(`[data-window-id="${tab.windowId}"]`)
    if (closedWindowEle){
        if (closedWindowEle.dataset.windowType === 'collapsed'){
            const closedWindowTabCnt = closedWindowEle.querySelector('.win-col-tab-cnt')
            createCollapsedTabEle(tab, closedWindowTabCnt)
        }
    }
    else{
        const closeTabsInnerCnt = closeTabCntEle.querySelector('.tabs-inner-cnt')
        const closedTabEle = createSingleTabEle(tab)
        closeTabsInnerCnt.prepend(closedTabEle)
    }
}

const createCollapsedTabEle = (tab, parentElement) =>{

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

const createSingleTabEle = (tab) =>{
    

    const isOpenWindow = tab.windowId ? true : false
    const isOpenTab = tab.id  ? true : false

    // Sigle Tab Template
    let singleTabEle = singleTabTemplateEle.content.cloneNode(true)
    //fix to make it an HTML element but not fragment
    singleTabEle = singleTabEle.querySelector('.single-tab') 

    // fav icon
    const favIconEle = singleTabEle.querySelector('.fav-icon')
    if (tab.favIconUrl) favIconEle.setAttribute('src', tab.favIconUrl)

    // title
    const titleEle = singleTabEle.querySelector('.title')
    titleEle.textContent = tab.title

    // url & time
    const titleSubEle = singleTabEle.querySelector('.title-sub')
    const urlEle = titleSubEle.getElementsByTagName('span')[0]
    if (tab.url) urlEle.textContent = getUrlDomin(tab.url) + ' • '
    const timeEle = titleSubEle.getElementsByTagName('span')[1]
    timeEle.textContent = ''
    timeEle.textContent = ' ' + getAgoTime(tab.time)


    // Audio Idicator
    if (tab.audible){
        const audioDotEle = singleTabEle.querySelector('.audio-dot')
        audioDotEle.classList.add('active')
    }


    // Tab Click
    singleTabEle.addEventListener('click', (e)=>{
        e.stopPropagation()
        if (isOpenWindow){
            chrome.windows.update(tab.windowId, {focused: true}).then(()=>{
                if (isOpenTab){
                    chrome.tabs.update(tab.id, {active: true})
                }
                else{
                    chrome.tabs.create({active: true, url: tab.url, windowId: tab.windowId})
                }
            })
        }
        else {
            chrome.tabs.create({active: true, url: tab.url})
        }
    })

    // Close Click
    const closeTabBtnEle = singleTabEle.querySelector('.close-btn') 
    if (!isOpenTab){
        // Closed tabs don't have close btn
        closeTabBtnEle.remove()
    }
    else{ 
        closeTabBtnEle.addEventListener('click', (e)=>{
            e.stopPropagation()
            chrome.tabs.remove(tab.id)
            singleTabEle.remove()
            delete tab.id
            createNewCloseTabEle(tab)
        })
    }
    return singleTabEle
}


const createCollapsedWindow = (window, time, isWindowActive)=>{

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
                window.map((tab)=> chrome.tabs.create({active: true, url: tab.url, windowId: newWindow.id}))

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


const createExapndWindow = (window, time, isWindowActive)=>{

    // Decode Window Id and it is opened or closed
    const isOpenWindow =  window[0].windowId ? true : false
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
        const titleEle = singleTabEle.querySelector('.title')
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
    
                // filter the window object to reflect the changes while creating the collapsed winowd
                window = window.filter((filterTab)=>filterTab.id !== tab.id)
                e.stopPropagation()
                chrome.tabs.remove(tab.id)
                singleTabEle.remove()
                delete tab.id
                createNewCloseTabEle(tab)
            })
        }
        else{
            closeTabBtnEle.remove()
        }

    })

    const toMinimizeBtn = winExpandEle.querySelector('.minimize')
    toMinimizeBtn.addEventListener('click', (e)=>{
        e.stopPropagation()
        const exapndWinEle = createCollapsedWindow(window, time, isWindowActive)
        winExpandEle.parentElement.insertBefore(exapndWinEle, winExpandEle)
        winExpandEle.remove()
    })

    return winExpandEle

}

const processOpenTabs = async () =>{
    //Get Stroed Tab Details (like time)
    await chrome.storage.local.get('openTabs').
        then((value)=> openTabsStored = value.openTabs)

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
        const [windows, winIdsSrtByTime] = processAllWindows(currTabs, activeWindowId)
        const allWindowEles = createAllExpandWindows(windows, winIdsSrtByTime, activeWindowId)
        openTabCntEle.appendChild(allWindowEles)
    }
    // Create Collapsed Window Elements
    else {
        const [windows, winIdsSrtByTime] = processAllWindows(currTabs, activeWindowId)
        const allCollapsedWindows = createAllCollapsedWindows(windows, winIdsSrtByTime, activeWindowId)
        openTabCntEle.appendChild(allCollapsedWindows)
    }

}



const createAllExpandWindows = (windows, winIdsSrtByTime, activeWindowId)=>{
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

const createAllCollapsedWindows = (windows, winIdsSrtByTime, activeWindowId)=>{
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



const processAllWindows = (allTabs, activeWindowId) =>{
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


const processClosedTabs = async () =>{
    let closedTabsOfOpenWin = chrome.storage.local.get('CTofOW')
    let closedTabsOfClosedWin = chrome.storage.local.get('CTofCW')
    if (!closeTabsViewMode){
        await chrome.storage.local.get('closeTabsViewMode').then((value)=>{
            closeTabsViewMode = value.closeTabsViewMode
        })
    }

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
            for (const CTOWtab of CTofCW){
                allClosedTabs.push(CTOWtab)
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
    handleMinMaxBtnClick(closeTabCntEle, closeTabsViewMode, false)
}



// [+] Script starts
// [+] Open Tabs
var openTabsStored

var closeTabsStored

var openTabsViewMode = 'T'
// By Default view by tab
// T tab view
// C Collapsed Window View
// E Expand Window View
processOpenTabs()

var closeTabsViewMode = undefined
processClosedTabs()




//Min max open Tab Button Click
const minMaxOpentabsBtn = openTabCntEle.querySelector('.open.tabs-cnt .min-max-btn')
minMaxOpentabsBtn.addEventListener('click', (e)=>{
    e.stopPropagation()
    if (openTabsViewMode !== 'C') openTabsViewMode = 'C'
    else openTabsViewMode = 'T'
    handleMinMaxBtnClick(openTabCntEle, openTabsViewMode, true)
    processOpenTabs()
})

const minMaxClosetabsBtn = closeTabCntEle.querySelector('.close.tabs-cnt .min-max-btn')
minMaxClosetabsBtn.addEventListener('click', (e)=>{
    e.stopPropagation()
    if (closeTabsViewMode !== 'C') closeTabsViewMode = 'C'
    else closeTabsViewMode = 'T'
    chrome.storage.local.set({closeTabsViewMode})
    handleMinMaxBtnClick(closeTabCntEle, closeTabsViewMode, true)
    processClosedTabs()
})

const sortByOpenTabBtn = openTabCntEle.querySelector('.open.tabs-cnt .sort-by')
sortByOpenTabBtn.addEventListener('click', (e)=>{
    e.stopPropagation()
    if (['E','C'].includes(openTabsViewMode)) openTabsViewMode = 'T'
    else openTabsViewMode = 'E'
    handleMinMaxBtnClick(openTabCntEle, openTabsViewMode, true)
    processOpenTabs()

})

const sortByCloseTabBtn = closeTabCntEle.querySelector('.close.tabs-cnt .sort-by')
sortByCloseTabBtn.addEventListener('click', (e)=>{
    e.stopPropagation()
    if (['E','C'].includes(closeTabsViewMode)) closeTabsViewMode = 'T'
    else closeTabsViewMode = 'E'
    chrome.storage.local.set({closeTabsViewMode})
    handleMinMaxBtnClick(closeTabCntEle, closeTabsViewMode, true)
    processClosedTabs()

})



const handleMinMaxBtnClick = (tabCntEle, viewMode, doRemoveInnerCnt)=> {
    // icon change
    const minMaxIconEle = tabCntEle.querySelector('.min-max-btn .material-symbols-outlined')
    if (['T', 'E'].includes(viewMode)) minMaxIconEle.textContent = 'arrow_drop_up'
    else minMaxIconEle.textContent = 'arrow_drop_down'

    // View By Icon or Sort By
    const sortByEle = tabCntEle.querySelector('.sort-by')
    const sortByOptionEle = tabCntEle.querySelector('.sort-by-option')
    if (viewMode === 'T') {
        sortByEle.style.borderColor = 'var(--view-by-tab-color)'
        sortByOptionEle.style.color = 'var(--view-by-tab-color)'
        sortByOptionEle.textContent = 'TAB'

    }
    else {
        sortByEle.style.borderColor = 'var(--view-by-window-color)'
        sortByOptionEle.style.color = 'var(--view-by-window-color)'
        sortByOptionEle.textContent = 'WINDOW'
    }


    if (doRemoveInnerCnt){
        tabCntEle.querySelector('.tabs-inner-cnt').remove()
    }

}

// Search bar
const searchBarInputEle = document.querySelector('.search-bar input')
console.log(searchBarInputEle)
searchBarInputEle.focus()
searchBarInputEle.addEventListener('input', (e)=>{

    console.log(e.target.value)
    const searchKeyWord = e.target.value.toUpperCase()

    if (closeTabsViewMode !== 'T'){
        closeTabsViewMode = 'T'
        handleMinMaxBtnClick(closeTabCntEle, closeTabsViewMode, true)
        processClosedTabs()
    }
    if (openTabsViewMode !== 'T'){
        openTabsViewMode = 'T'
        handleMinMaxBtnClick(openTabCntEle, openTabsViewMode, true)
        processOpenTabs()
    }


    //Filter open tabs
    const isAllOpenTabsFilteredOut = filterTabEleOnSearch(openTabCntEle, searchKeyWord)
    
    //Audio Tabs
    const isAllAudioTabsFilteredOut = filterTabEleOnSearch(audioVideoTabCntEle, searchKeyWord)
    
    
    //Filter closed tabs
    const isAllClosedTabsFilteredOut = filterTabEleOnSearch(closeTabCntEle, searchKeyWord)

    // All tabs no Removed
    if (isAllOpenTabsFilteredOut && isAllAudioTabsFilteredOut && isAllClosedTabsFilteredOut){
        if (!document.querySelector('.no-tabs-msg-cnt')){
            const noTabsFoundMsgEle = document.createElement('div')
            noTabsFoundMsgEle.classList.add('no-tabs-msg-cnt')
            noTabsFoundMsgEle.textContent = 'No Results Found'
            document.querySelector('body').appendChild(noTabsFoundMsgEle)
        }
    }
    else{
        if (document.querySelector('.no-tabs-msg-cnt')){
            document.querySelector('.no-tabs-msg-cnt').remove()
        }
    }
    
})


const filterTabEleOnSearch = (tabCntEle, searchKeyWord)=>{
    //Filter open tabs
    const tabElements = tabCntEle.getElementsByClassName('single-tab')
    let countFilteredElements = 0

    for (const tabEle of tabElements){
        if (searchKeyWord.length === 0) {
            tabEle.style.display = 'grid'
            continue
        }
        const titleText = tabEle.getElementsByClassName('title')[0].textContent.toUpperCase()
        if (titleText.match(searchKeyWord)){
            tabEle.style.display = 'grid'
            continue
        }

        const urlText = tabEle.querySelector('.title-sub span').textContent.toUpperCase()
        if (urlText.match(searchKeyWord)){
            tabEle.style.display = 'grid'
            continue
        }
        tabEle.style.display = 'none'
        countFilteredElements++
    }

    const allTabsFilteredOut = countFilteredElements === tabElements.length 
    if (allTabsFilteredOut){
        tabCntEle.style.display = 'none'
    }
    else{
        tabCntEle.style.display = 'block'

    }
    return allTabsFilteredOut
}

// Background Script testing


