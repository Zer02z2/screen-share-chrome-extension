import { io } from "socket.io-client"
import { Peer } from "peerjs"
import { v4 as uuidv4 } from "uuid"

interface PeerUser {
  id: string
  canvas: HTMLCanvasElement
  video?: HTMLVideoElement
  mouseX: number
  mouseY: number
  videoW: number
  videoH: number
}

let currentPeers: PeerUser[] = []

const roomId = 1
const dev = false
const socketUrl = `${
  dev
    ? "http://localhost:3001/screenShare"
    : "https://io.zongzechen.com/screenShare"
}`
const socket = io(socketUrl)

const createCanvas = () => {
  const canvas = document.createElement("canvas")
  canvas.style.position = "fixed"
  canvas.style.width = "100vw"
  canvas.style.height = "100vh"
  canvas.style.zIndex = "999"
  canvas.style.left = "0"
  canvas.style.top = "0"
  canvas.style.pointerEvents = "none"
  document.body.appendChild(canvas)
  return canvas
}

const createVideo = (stream: MediaStream) => {
  const video = document.createElement("video")
  video.srcObject = stream
  video.addEventListener("loadedmetadata", () => {
    video.play()
  })
  return video
}

const init = async () => {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: false,
  })

  const myPeer = new Peer(uuidv4(), {
    host: "io.zongzechen.com",
    port: 9000,
  })
  myPeer.on("open", (id) => {
    socket.emit("join-room", roomId, id)
  })

  myPeer.on("call", (call) => {
    console.log("receive call")
    call.answer(stream)

    call.on("stream", (userVideoStream) => {})
  })
  myPeer.on("connection", (conn) => {
    conn.on("open", () => {
      conn.on("data", (data) => {
        console.log(data)
      })
      window.addEventListener("mousemove", (event) => {
        conn.send({
          mouseX: event.clientX,
          mouseY: event.clientY,
          videoW: window.innerWidth,
          videoH: window.innerHeight,
        })
      })
    })
  })

  socket.on("user-connected", (userId) => {
    const call = myPeer.call(userId, stream)
    const conn = myPeer.connect(userId)
    const peerUser: PeerUser = {
      id: userId,
      canvas: createCanvas(),
      mouseX: 0,
      mouseY: 0,
      videoW: 0,
      videoH: 0,
    }
    if (!currentPeers.find((peer) => peer.id === userId)) {
      currentPeers.push(peerUser)
    }
    call.on("stream", (userVideoStream) => {
      peerUser.video = createVideo(userVideoStream)
    })
    call.on("close", () => {})
    conn.on("open", () => {
      console.log("data open")
      conn.on("data", (data) => {
        console.log(data)
        const peerData = data as {
          mouseX: number
          mouseY: number
          videoW: number
          videoH: number
        }
        peerUser.mouseX = peerData.mouseX
        peerUser.mouseY = peerData.mouseY
        peerUser.videoW = peerData.videoW
        peerUser.videoH = peerData.videoH
      })
      document.addEventListener("mousemove", (event) => {
        conn.send({
          mouseX: event.clientX,
          mouseY: event.clientY,
          videoW: window.innerWidth,
          videoH: window.innerHeight,
        })
      })
    })
  })
}
const animate = () => {
  currentPeers.forEach((peer) => {
    const canvas = peer.canvas
    const video = peer.video
    const ctx = canvas.getContext("2d")
    if (!(ctx && video)) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const mouseX = (canvas.width * peer.mouseX) / peer.videoW
    const mouseY = (canvas.height * peer.mouseY) / peer.videoH
    const res = 5

    for (let i = 0; i < canvas.width; i += res) {
      for (let j = 0; j < canvas.height; j += res) {
        const dist = Math.sqrt((mouseX - i) ** 2 + (mouseY - j) ** 2)
        if (dist > 50) ctx.clearRect(i, j, res, res)
      }
    }
  })
  requestAnimationFrame(animate)
}

init()
animate()
