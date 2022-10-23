import { processClosedTabs } from "./processClosedTabs.js"
import { processOpenTabs } from "./processOpenTabs.js"

//Tab Containers
const openTabCntEle =  document.getElementsByClassName('open tabs-cnt')[0]
const closeTabCntEle =  document.getElementsByClassName('close tabs-cnt')[0]

export const handleMinMaxBtnClick = (tabCntEle, viewMode)=> {
    // Min Max Btn
    const minMaxBtnEle = tabCntEle.querySelector('.min-max-btn')
    if (viewMode === 'C') minMaxBtnEle.title = 'Expand Windows' 
    else minMaxBtnEle.title = 'Collapse Windows'
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

    // Refresh the Container
    if(tabCntEle.querySelector('.tabs-inner-cnt')) tabCntEle.querySelector('.tabs-inner-cnt').remove()

}
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