console.log('Background is running!')

const createTabObj = (tab, doUpdateTime) => { //Get required property
    let time 
    const date = new Date()
    if (!doUpdateTime) time = openTabsStored[tab.id].time
    else time = date.getTime()
    return {id: tab.id, windowId: tab.windowId, time, 
        favIconUrl: tab.favIconUrl, url: tab.url, title: tab.title}
}

const updateLocalStorage = (obj)=>{
    if (obj.openTabsStored) chrome.storage.local.set({'openTabs': obj.openTabsStored}) //Open Tabs of Opened Window
    if (obj.closedTabsOfOpenWin) chrome.storage.local.set({'CTofOW': obj.closedTabsOfOpenWin}) //Closed Tab of Open Window
    if (obj.closedTabsOfClosedWin) chrome.storage.local.set({'CTofCW': obj.closedTabsOfClosedWin}) //Closed Tab of Closed Window
}

const getAllLocalStorage = async ()=>{
    // Current Tabs
    let openTabsCurr = chrome.tabs.query({})

    // Get from Storage
    openTabsStored = chrome.storage.local.get('openTabs')
    closedTabsOfOpenWin = chrome.storage.local.get('CTofOW')
    closedTabsOfClosedWin = chrome.storage.local.get('CTofCW')
    
    openTabsCurr = await openTabsCurr
    openTabsStored = await openTabsStored
    closedTabsOfOpenWin = await closedTabsOfOpenWin
    closedTabsOfClosedWin = await closedTabsOfClosedWin

    // Re-initialize Objects if not available
    if (!openTabsStored.openTabs) openTabsStored = {}
    else openTabsStored = openTabsStored.openTabs

    if (!closedTabsOfOpenWin.CTofOW) closedTabsOfOpenWin = {}
    else closedTabsOfOpenWin = closedTabsOfOpenWin.CTofOW

    if (!closedTabsOfClosedWin.CTofCW) closedTabsOfClosedWin = []
    else closedTabsOfClosedWin = closedTabsOfClosedWin.CTofCW

    // Sync curr and stored tabs
    const openTabsCurrObj = {} //Since the chrome.tabs.query gives in array form
    for (const tab of openTabsCurr){
        if (!openTabsStored[tab.id]){
            console.log('Missed Open Tab', tab)
            openTabsStored[tab.id] = createTabObj(tab, true)
        }
        openTabsCurrObj[tab.id] = tab 
    }
    
    updateLocalStorage({openTabsStored, closedTabsOfOpenWin, closedTabsOfClosedWin})

    // Sync stored and curr tabs
    const notStoredWindowIds = []
    for (const [tabId, tabObj] of Object.entries(openTabsStored)){
        if (!openTabsCurrObj[tabId]){
            handleClosedTab(tabId) 
            if (!notStoredWindowIds.includes(tabObj.windowId)) notStoredWindowIds.push(tabObj.windowId) 
        }
    }

    // Check whether not stored windows are open window
    notStoredWindowIds.map((windowId, index)=>{
        chrome.windows.get(windowId).catch(()=>{
            handleClosedWindow(windowId)
        })
    })

}


const handleClosedTab = (tabId)=>{
    if (!openTabsStored[tabId]){
        console.log('Recently closed Tab is not in local storage', tabId)
        return
    }

    const closedTabObj = createTabObj(openTabsStored[tabId], true)
    delete closedTabObj.id // Since Closed tab id becomes invalid

    // Delete Stored tab
    delete openTabsStored[tabId]
    updateLocalStorage({openTabsStored})


    //Avoid duplicate tab in window level
    for (const openTabId in openTabsStored){
        if (openTabsStored[openTabId].windowId === closedTabObj.windowId){
            if (openTabsStored[openTabId].url === closedTabObj.url){
                return
            }
        }
    }
    console.log('new closed tab')

    //First closed tab of a window
    if (!closedTabsOfOpenWin[closedTabObj.windowId]) {
        closedTabsOfOpenWin[closedTabObj.windowId] = []
    }

    //Filter old closed tab with the same URL
    closedTabsOfOpenWin[closedTabObj.windowId] = closedTabsOfOpenWin[closedTabObj.windowId].
                                filter(iterTab=>iterTab.url !== closedTabObj.url)
    closedTabsOfOpenWin[closedTabObj.windowId].push(closedTabObj)

    updateLocalStorage({closedTabsOfOpenWin})
}

const handleClosedWindow = (windowId) => {
    if (!closedTabsOfOpenWin[windowId]) {
        console.log('[-] closed window missed!', windowId)
        return
    }
    console.log('closed window')

    // Get closed window from closed tabs of open window
    const closedWindow = closedTabsOfOpenWin[windowId].slice()

    // Delete window id property of each tab
    for (const closedTab of closedWindow){
        delete closedTab.windowId
    }

    // Put it to closed window local storage
    closedTabsOfClosedWin.push(closedWindow)
    if (closedTabsOfClosedWin.length > 2){
        closedTabsOfClosedWin = closedTabsOfClosedWin.slice(1)
    }
    updateLocalStorage({closedTabsOfClosedWin, closedTabsOfOpenWin})


    delete closedTabsOfOpenWin[windowId]

}

// Program Starts [+]
var openTabsCurr, openTabsStored, closedTabsOfOpenWin, closedTabsOfClosedWin
var lastFocusedWindowId = -1

getAllLocalStorage().then(()=>{
    // Handle Event Listeners
    chrome.tabs.onCreated.addListener(tab=>{
        openTabsStored[tab.id] = createTabObj(tab, true)
        updateLocalStorage({openTabsStored})

        // Check similar tab in closed tab of open window and remove it
        const updatedTab = openTabsStored[tab.id] 
        if (closedTabsOfOpenWin[tab.windowId]){
            const closedWindow = closedTabsOfOpenWin[tab.windowId]
            const newWindow = closedWindow.filter((closedTab)=>
                closedTab.url !== updatedTab.url)
            closedTabsOfOpenWin[tab.windowId] = newWindow
            updateLocalStorage({closedTabsOfOpenWin})
        }
    })
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab)=>{
        openTabsStored[tab.id] = createTabObj(tab, false)
        updateLocalStorage({openTabsStored})

        // Check similar tab in closed tab of open window and remove it
        const updatedTab = openTabsStored[tab.id] 
        if (closedTabsOfOpenWin[tab.windowId]){
            const closedWindow = closedTabsOfOpenWin[tab.windowId]
            const newWindow = closedWindow.filter((closedTab)=>
                closedTab.url !== updatedTab.url)
            closedTabsOfOpenWin[tab.windowId] = newWindow
            updateLocalStorage({closedTabsOfOpenWin})
        }
    })
    chrome.tabs.onActivated.addListener(activeInfo=>{
        const tab =  openTabsStored[activeInfo.tabId]
        openTabsStored[activeInfo.tabId] = createTabObj(tab, true)
        updateLocalStorage({openTabsStored})
    })

    chrome.windows.onFocusChanged.addListener(windowId=>{
        if (windowId === lastFocusedWindowId) return
        if (windowId === -1) return
        lastFocusedWindowId = windowId
        chrome.tabs.query({active: true, windowId}).then((tabs)=>{
            const tab = createTabObj(tabs[0], true)
            openTabsStored[tab.id] = tab
            updateLocalStorage({openTabsStored})
        })
    })

    chrome.tabs.onRemoved.addListener(handleClosedTab)
    chrome.windows.onRemoved.addListener(handleClosedWindow)
})




