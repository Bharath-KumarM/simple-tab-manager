import { onSearchBarInputChange } from "./components/searchBar.js"
import { processClosedTabs } from "./components/processClosedTabs.js"
import { processOpenTabs } from "./components/processOpenTabs.js"
import "./components/countUserOpen.js" //counts user open and put banner message based on it



// By Default view by tab
// T tab view
// C Collapsed Window View
// E Expand Window View
chrome.storage.local.set({'openTabsViewMode': 'T'},()=>{
    processOpenTabs()
})

processClosedTabs()

// Search bar
const searchBarInputEle = document.querySelector('.search-bar input')
searchBarInputEle.focus()
searchBarInputEle.addEventListener('input', (e) => {
    onSearchBarInputChange(e)
})

//Closed Tabs MinMax Btn
const minMaxClosetabsBtn = closeTabCntEle.querySelector('.close.tabs-cnt .min-max-btn')
minMaxClosetabsBtn.addEventListener('click', (e)=>{
    e.stopPropagation()
    let closeTabsViewMode
    chrome.storage.local.get('closeTabsViewMode',(value) =>{
        closeTabsViewMode = value.closeTabsViewMode
        if (closeTabsViewMode !== 'C') closeTabsViewMode = 'C'
        else closeTabsViewMode = 'T'
        chrome.storage.local.set({closeTabsViewMode})
        processClosedTabs()
    })
})
//Closed Tabs Sort Btn
const sortByCloseTabBtn = closeTabCntEle.querySelector('.close.tabs-cnt .sort-by')
sortByCloseTabBtn.addEventListener('click', (e)=>{
    e.stopPropagation()
    let closeTabsViewMode
    chrome.storage.local.get('closeTabsViewMode',(value) =>{
        closeTabsViewMode = value.closeTabsViewMode
        if (['E','C'].includes(closeTabsViewMode)) closeTabsViewMode = 'T'
        else closeTabsViewMode = 'E'
        chrome.storage.local.set({closeTabsViewMode})
        processClosedTabs()
    })
})

//Open tabs
//Min max open Tab Button Click
const minMaxOpentabsBtn = openTabCntEle.querySelector('.open.tabs-cnt .min-max-btn')
minMaxOpentabsBtn.addEventListener('click', (e)=>{
    e.stopPropagation()
    let openTabsViewMode
    chrome.storage.local.get('openTabsViewMode',(value) =>{
        openTabsViewMode = value.openTabsViewMode
        if (openTabsViewMode !== 'C') openTabsViewMode = 'C'
        else openTabsViewMode = 'T'
        chrome.storage.local.set({openTabsViewMode})
        processOpenTabs()
    })
})

const sortByOpenTabBtn = openTabCntEle.querySelector('.open.tabs-cnt .sort-by')
sortByOpenTabBtn.addEventListener('click', (e)=>{
    e.stopPropagation()
    let openTabsViewMode
    chrome.storage.local.get('openTabsViewMode',(value) =>{
        openTabsViewMode = value.openTabsViewMode
        if (['E','C'].includes(openTabsViewMode)) openTabsViewMode = 'T'
        else openTabsViewMode = 'E'
        chrome.storage.local.set({openTabsViewMode})
        processOpenTabs()
    })

})
