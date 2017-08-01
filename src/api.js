let fetchItem = id => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({title:'该页面的数据处理用了3秒'})
        }, 3000)
    })
}
export {fetchItem}