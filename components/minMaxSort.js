
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


