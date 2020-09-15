
const canvas = document.getElementById("canvas")

const height = 20
const width = 20
const blockSize = 30
const friqency = 10

canvas.width = width*blockSize
canvas.height = height*blockSize


let wait = 0
let tarn = 0

let domain = ""



const loadImage = (url) => new Promise((resolve)=>{
  let img = new Image
  img.addEventListener("load",()=>{
    resolve(img)
  },false)
  img.src = url
})

let emojis




const load = async ()=>{
  
 
  document.getElementById("share").style.display = "none"
  document.getElementById("yomikomi").style.display = "none"
  
  document.getElementById("again").style.display = "none"

  canvas.style.display = "none"
  
  

  let emojisJson = -1

  while(1){
    
    document.getElementById("yomikomi").style.display = "none"
    await (()=>new Promise(resolve=>{
      document.getElementById("go").onclick = ()=>{
        domain = document.getElementById("domain").value
        resolve()
      }})
    )()

    document.getElementById("yomikomi").style.display = "block"

    emojisJson = await getEmojis()
    if(emojisJson!==-1){break}else{alert("絵文字の取得に失敗しました")}

  }

  const NatureEmojis = JSON.parse(emojisJson)
  const imgs = await Promise.all(NatureEmojis.map(elm=>loadImage(elm.static_url)))
  emojis = NatureEmojis.map((elm,index)=>{return {"shortcode":elm.shortcode,"img":imgs[index],"position":[0,0]}})

  emojis = emojis.filter(elm=>elm.shortcode !== "blank")

  document.getElementById("yomikomi").style.display = "none"
  document.getElementById("domain").style.display = "none"
  document.getElementById("go").style.display = "none"
  canvas.style.display = "block"
}


const main = async () => {
  
  
  
  document.getElementById("again").style.display = "none"
  
  document.getElementById("share").style.display = "none"
  
  let isGameOver = false
  let privious = [[1,1]]

  let field = []

  let reloadFlag = false

  let snakePosition = []
  
  const context = canvas.getContext( "2d" )
  
  context.beginPath()
  
  context.fillStyle = "rgb(255,255,255)"
  context.rect(0, 0,width*blockSize, height*blockSize)
  context.fill()

    context.beginPath()
    
    context.rect(
        0, 0,
        blockSize, height*blockSize,
    )
    context.rect(
      0, 0,
      width*blockSize, blockSize,
    )
    context.rect(
      width*blockSize - blockSize, 0,
      blockSize, blockSize*height,
    )
    context.rect(
      0, height*blockSize-blockSize,
      width*blockSize, blockSize,
    )
    context.fillStyle = "rgb(0,0,0)"
    context.fill()

    

    for(let i=0; i<height; i++){
      for(let j=0; j<width; j++){
        if(i>0 && i<height-1 && j>0 && j<width-1){
          field.push([i,j])
        }
      }
    }

    
    
  let keepOutPositionsInit = [[1,1],[2,1],[3,1],[1,2],[2,2],[3,2],[1,3],[2,3],[3,3]]


  let pickUpFieldInit = field.filter((elm)=>{
    for(let count=0; count<keepOutPositionsInit.length; count++){
      if(keepOutPositionsInit[count][0]===elm[0] && keepOutPositionsInit[count][1]===elm[1]){return false}
    }
    return true
  })

  let emojiTmp = emojis.concat()

  let foods = (()=>{
    let result = []
    for(let i=0; i<30; i++){
      let random = Math.floor(Math.random()*pickUpFieldInit.length)
      let rand = pickUpFieldInit[random]
      pickUpFieldInit.splice(random,1)
      
      let r = Math.floor(Math.random()*emojiTmp.length)
      let randomEmoji = {...emojiTmp[r]}
      emojiTmp.splice(r,1)
      randomEmoji.position[0] = rand[0]
      randomEmoji.position[1] = rand[1]

      const foodGraphic = new EmojiGraphic(canvas,randomEmoji.img,randomEmoji.shortcode)
      foodGraphic.x = randomEmoji.position[0]*blockSize
      foodGraphic.y = randomEmoji.position[1]*blockSize
      foodGraphic.width = blockSize
      foodGraphic.height = blockSize
      randomEmoji.graphic = foodGraphic

      result.push(randomEmoji)
    }
    return result
  })()

  for(let i=0; i<1; i++){
    let img = await loadImage("./reload.png")
    let snakeHeadGraphic = new EmojiGraphic(canvas,img,null)
    
    snakePosition.push([1,1,snakeHeadGraphic,0,0])
    
    
    snakeHeadGraphic.x = snakePosition[0][0]*blockSize
    snakeHeadGraphic.y = snakePosition[0][0]*blockSize
    snakeHeadGraphic.height = blockSize
    snakeHeadGraphic.width = blockSize
    snakeHeadGraphic.shortcode = false
  }

  
  let isSnakeHeadInitialize = false
  

  let direction = 1

  document.body.addEventListener('keydown',
    event => {
      switch (event.key) {
        case "ArrowUp":
          if(direction!=2){direction = 0}
          break;
        case "ArrowRight":
          if(direction!=3){direction = 1}
          break;
        case "ArrowDown":
          if(direction!=0){direction = 2}
          break;
        case "ArrowLeft":
          if(direction!=1){direction = 3}
          break;
      }
    })
    let reload
    {
    let random = pickUpFieldInit[Math.floor(Math.random()*pickUpFieldInit.length)]
    let img = await loadImage("./reload.png")

    reload = [random[0],random[1],new EmojiGraphic(canvas, img,null)]
      
    reload[2].x = reload[0]*blockSize
    reload[2].y = reload[1]*blockSize
    reload[2].width = blockSize
    reload[2].height = blockSize
    }
    


  const loop = () => {
    snakePosition.forEach(elm=>{
      elm[2].x += (elm[3]/friqency)*blockSize
      elm[2].y += (elm[4]/friqency)*blockSize
    })

    if(friqency%5===0)foods.forEach(elm=>elm.graphic.removeImage().putImage())

    wait++
    if(wait<friqency){
      requestAnimationFrame(loop)
      return
    }
    wait = 0

    const reput = () => {
      
        
      let keepOutPositions = snakePosition.map(block=>[block[0],block[1]])
      

      for(let i=0; i<5; i++){
        let ky = snakePosition[0][1]+(i-2)
        for(let j=0; j<5; j++){
          let kx = snakePosition[0][0]+(j-2)

          keepOutPositions.push([kx,ky])
        }
      }

      let pickUpField = field.filter(elm=>{
        for(let count=0; count<keepOutPositions.length; count++){
          if(keepOutPositions[count][0]===elm[0] && keepOutPositions[count][1]===elm[1]){return false}
        }
        return true
      })


      
      let emojiTmp = emojis.concat()
      console.log(emojiTmp.length)

      console.log("--------------------------------------")

      for(let j=0; j<foods.length; j++){
        let random = Math.floor(Math.random()*pickUpField.length)
        let randomElm = pickUpField[random]
        pickUpField.splice(random,1)
        

        let r = Math.floor(Math.random()*emojiTmp.length)
        randomEmoji =  emojiTmp[r]
        
        emojiTmp = emojiTmp.filter(elm=>elm.shortcode !== randomEmoji.shortcode)
        
        foods[j].graphic.img = randomEmoji.img
        foods[j].graphic.x = randomElm[0]*blockSize
        foods[j].graphic.y = randomElm[1]*blockSize
        foods[j].shortcode = randomEmoji.shortcode
        foods[j].img = randomEmoji.img
        foods[j].position[0] = randomElm[0]
        foods[j].position[1] = randomElm[1]
      }

      let randomElm = pickUpField[Math.floor(Math.random()*pickUpField.length)]
      reload[0] = randomElm[0]
      reload[1] = randomElm[1]
      reload[2].x = randomElm[0]*blockSize
      reload[2].y = randomElm[1]*blockSize
    }

    if(snakePosition[0][0]===reload[0] && snakePosition[0][1]===reload[1]){
      reput()
    }

    for(let i=0; i<foods.length; i++){
      if(foods[i].position[0] === snakePosition[0][0] && foods[i].position[1] === snakePosition[0][1]){
        let newSnakeGraphic = new EmojiGraphic(canvas,foods[i].img,foods[i].shortcode)
        newSnakeGraphic.width = blockSize
        newSnakeGraphic.height = blockSize
        if(!isSnakeHeadInitialize){
          snakePosition[0] = [foods[i].position[0],foods[i].position[1],newSnakeGraphic,0,0]
          isSnakeHeadInitialize=true
        }else{
          snakePosition.push([foods[i].position[0],foods[i].position[1],newSnakeGraphic,0,0])
          privious.push([foods[i].position[0],foods[i].position[1]])

        }
        reput()

      }
    }

    
    snakePosition.forEach(elm=>{
      elm[2].x = elm[0]*blockSize
      elm[2].y = elm[1]*blockSize
    })
    

    for(let i=0; i<snakePosition.length-1; i++){
      const backIndex = snakePosition.length -1 - i
      snakePosition[backIndex][0] = snakePosition[backIndex-1][0]
      snakePosition[backIndex][1] = snakePosition[backIndex-1][1]
    }

    



    switch (direction) {
      case 0:
        snakePosition[0][1] -= 1
        break
      case 1:
        snakePosition[0][0] += 1
        break
      case 2:
        snakePosition[0][1] += 1
        break
      case 3:
        snakePosition[0][0] -= 1
        break
    }
    tarn ++ ;

    snakePosition.forEach((elm,index)=>{
        elm[3] = elm[0]-privious[index][0]
        elm[4] = elm[1]-privious[index][1]
    })

    privious = snakePosition.map(elm=>{
      return [elm[0],elm[1]]
    })
    

    if(snakePosition[0][0]<1 || snakePosition[0][0]>width-2 || snakePosition[0][1] < 1 || snakePosition[0][1] > height - 2){
      isGameOver = true
      gameOver(snakePosition)
      return
    }

    for(let scanIndex=1; scanIndex<snakePosition.length; scanIndex++){
      if(snakePosition[0][0] === snakePosition[scanIndex][0] && snakePosition[0][1] === snakePosition[scanIndex][1]){
        isGameOver = true
        gameOver(snakePosition)
        return 
      }
    }

    if(!isGameOver){
      requestAnimationFrame(loop)
    }
  }
  requestAnimationFrame(loop)
}

const gameOver = (snakePosition)=>{
  const head = 'https://'+domain+'/share?text='
  const ad = location.href + " でスネークゲームを遊びました"
  let result = []
  if(snakePosition[0][2].shortcode){
    result = snakePosition.map(elm=>elm[2].shortcode)
  }
  let resultStr = ""
  for(let elm of result){
    if(head.length + resultStr.length + elm.length + ad.length < 497){
      resultStr += ":"+elm+": "
    }else{
      resultStr += "..."
    }
  }
  document.getElementById("share").onclick = ()=>{
    window.open('https://'+domain+'/share?text='+encodeURI(resultStr + " " + ad))
  }

  document.getElementById("again").onclick = ()=>{
    main()
  }
  document.getElementById("share").style.display = "block"
  document.getElementById("again").style.display = "block"

}

class EmojiGraphic{
  constructor(canvas,img,shortcode,x=-100,y=-100,w=0,h=0){
    this.image = img
    this.shortcode = shortcode
    this._x = x
    this._y = y
    this._width = w
    this._height = h
    this.canvas = canvas
  }

  get img(){
    return image
  }

  set img(img){
    this.image = img
  }

  get x(){
    return this._x
  }
  set x(x){
    this.removeImage()
    this._x = x
    this.putImage()
  }
  
  get y(){
    return this._y
  }
  set y(y){
    this.removeImage()
    this._y = y
    this.putImage()
  }

  get width(){
    return this._width
  }
  set width(width){
    this.removeImage()
    this._width = width
    this.putImage()
  }

  get height(){
    return this._height
  }
  set height(height){
    this.removeImage()
    this._height = height
    this.putImage()
  }
  
  putImage(){
    this.canvas.getContext('2d').drawImage(this.image, this._x, this._y, this._width,this._height);
    return this
  }

  removeImage(){
    this.canvas.getContext('2d').clearRect(this._x, this._y, this._width, this._height)
    return this
  }
}



/**
 * 絵文字を取得する
 * パースして返す
 */
const getEmojis = async () =>new Promise((resolve, reject)=> {
    const req = new XMLHttpRequest();
    req.addEventListener("abort",()=>{
      resolve(-1)
    })
    req.onreadystatechange = () => {
        if (req.readyState == 4) { // 通信の完了時
          if (req.status == 200) { // 通信の成功時
            resolve(req.responseText)
          }else{
            console.log("failed")
            resolve(-1)
          }
        }
    }

      req.open('GET', "https://"+domain+"/api/v1/custom_emojis", true)
      req.send(null);

})
!(async()=>{
  
await load()
await main()
})()