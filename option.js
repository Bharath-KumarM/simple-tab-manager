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
