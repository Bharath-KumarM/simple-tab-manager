
export const getAgoTime = (time)=>{
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

export const getUrlDomin = (givenUrl)=>{
    let url = new URL(givenUrl)
    return url.hostname

}

export const getRandomColor = () =>{
    let maxVal = 0xFFFFFF; // 16777215
    let randomNumber = Math.random() * maxVal; 
    randomNumber = Math.floor(randomNumber);
    randomNumber = randomNumber.toString(16);
    let randColor = randomNumber.padStart(6, 0);   
    return `#${randColor.toUpperCase()}`
}