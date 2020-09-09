
//-------------------------------------------------------
// Configuration
let speed = 1.8 // Speed of enemy ships coming towards player

//-------------------------------------------------------
// Test empty entity
const emptyEnt = new Entity()
engine.addEntity(emptyEnt)

//-------------------------------------------------------
// Create all the ships
class LaserExpirationLoop implements ISystem {
  update(dt: number): void {
    for (let entity of lasers.entities) {
      let stats = entity.getComponent(Laser)
      stats.lifespan -= 1 // Decrease lifespan

      if (stats.lifespan <= 0) // Remove laser after lifespan
        engine.removeEntity(entity)
    }
  }
}
engine.addSystem(new LaserExpirationLoop());

@Component('laser')
export class Laser {
 lifespan: number = 16 // Lifespan of laser in frames
}

@Component('shipStats')
export class ShipStats {
 active: boolean = false
 health: number = 3 // Health of normal enemy ship
}


@Component('Movement')
export class MovingShip {
}


//-------------------------------------------------------
// Initialization
let lasers = engine.getComponentGroup(Laser)
let ships = engine.getComponentGroup(MovingShip)
let timer = 0
let tick = 0
let tock = 0
let killsThisRound = 0
let playerHealth = 5

//-------------------------------------------------------
// Function to spawn ships
function SpawnShips(amount, yPos, giant) {
  
  for (let i = 0; i < amount; i++) 
  {
    const enemyShipInstance = new Entity()
    const transform = new Transform(
      {
        scale:new Vector3(0.3, 0.3, 0.3)
      }
    )
    
    enemyShipInstance.addComponent(new GLTFShape("models/EnemyShip.glb"))
    enemyShipInstance.addComponentOrReplace(transform)
    
    // Make ship always face player
    enemyShipInstance.addComponent(new Billboard())
  
    // starting positions
    transform.position.set(19.5 + i * (12/amount), yPos, 37)
  
    // Give ship stats
    enemyShipInstance.addComponent(new ShipStats)

    // If boss ship
    if (giant == 1)
    {
      enemyShipInstance.getComponent(Transform).scale = new Vector3(2.0,2.0,2.0) // Boss ship
      enemyShipInstance.getComponent(ShipStats).health = 50 // Boss ship
    }
  
    // Make clickable
  
    enemyShipInstance.addComponent(
      new OnPointerDown(e => {
        let stats = enemyShipInstance.getComponent(ShipStats)
  
        // Deal damage
        stats.health -= 3
  
        // Kill ship if health falls to 0
        if (stats.health <= 0){
          engine.removeEntity(enemyShipInstance)
          explosionSound.getComponent(AudioSource).playOnce()
          killsThisRound++ // Increase kill count by 1
        }
        //log('shot ship, remaining hp: ' + stats.health)
  
        // Play audio
        gunShot.getComponent(AudioSource).playOnce()
        
        // Create laser effect
  
        let laser = new Entity()
        laser.addComponent(new GLTFShape("models/Laser.glb"))
        laser.addComponent(new Transform({
          position: new Vector3(Camera.instance.position.x, Camera.instance.position.y - 0.2, Camera.instance.position.z),
          scale: new Vector3(0.2, 0.2, 2.0)
        }))
  
  
        // Make laser effect look at enemy ship
        laser.getComponent(Transform).lookAt(new Vector3(enemyShipInstance.getComponent(Transform).position.x, enemyShipInstance.getComponent(Transform).position.y, enemyShipInstance.getComponent(Transform).position.z))
        laser.addComponent(new Laser())
  
        engine.addEntity(laser)
  
      },
      {
        button: ActionButton.POINTER,
        showFeedback: true,
        hoverText: "Shoot",
      })
     )
    
  
    enemyShipInstance.addComponent(new MovingShip())
    engine.addEntity(enemyShipInstance)
  }
}


//-------------------------------------------------------
class MovingShips implements ISystem {
	update(dt: number) {
		const delta = speed * dt
		for (let entity of ships.entities) {
			if (entity != emptyEnt) { // Test conditional (condition serves no actual purpose other than learning example)
				const transform = entity.getComponent(Transform)

        // Player camera position raycast so enemy ships fly towards the player
        let physicsCast = PhysicsCast.instance
        let camRay = physicsCast.getRayFromCamera(1)
        var camDir = camRay.direction
        
        let camRay_x = camDir.x * -1
        let camRay_y = camDir.y * -1
        let camRay_z = camDir.z * -1

        // Enemy to player vector
        let ray_vec3 = new Vector3(camRay_x*speed*0.03, camRay_y*speed*0.03, camRay_z*speed*0.03)

        // Translate enemy towards player
        transform.translate(ray_vec3)

        // Don't let ships below ground
        if (transform.position.y < 1)
        {
          transform.translate(new Vector3(ray_vec3.x, ray_vec3.y + 2.0, ray_vec3.z))
        }

        // Check distance to player and deal damage if collided
        let dist = distance(transform.position, Camera.instance.position)

        // Collision
        if (dist < 2)
        {
          playerHealth--
          killsThisRound++

          if (playerHealth != 0)
            voice9.getComponent(AudioSource).playOnce() // watchout!

          engine.removeEntity(entity)

          if (playerHealth == 4)
            heart5.visible = false
          else if (playerHealth == 3)
            heart4.visible = false
          else if (playerHealth == 2)
            heart3.visible = false
          else if (playerHealth == 1)
            heart2.visible = false
          else if (playerHealth == 0)
          {
            heart1.visible = false
            voice8.getComponent(AudioSource).playOnce() // get them next time!
            lvlTxt.value = "DEFEATED!"
          }
        }

				// if (transform.position.x >= 31)
        //   transform.position.x -= 30
          
        
			}
		}
	}
}

//-------------------------------------------------------


// space center
let spaceCenter = new Entity()
spaceCenter.addComponent(new GLTFShape("models/SpaceGameJamWithCollider.glb"))
spaceCenter.addComponent(new Transform({
  position: new Vector3(2, 0, 2),
  scale:new Vector3(0.7, 0.7, 0.7)
}))
engine.addEntity(spaceCenter)


// space ship
let spaceship = new Entity()
spaceship.addComponent(new GLTFShape("models/Spaceship.glb"))
spaceship.addComponent(new Transform({
  position: new Vector3(3, 1.0, -22),
  scale:new Vector3(1.0, 1.0, 1.0)
}))
// engine.addEntity(spaceship)


// space skybox
let spaceSkybox = new Entity()
spaceSkybox.addComponent(new GLTFShape("models/SpaceSkybox.glb"))
spaceSkybox.addComponent(new Transform({
  position: new Vector3(9, 15, 17),
  scale:new Vector3(0.75, 0.75, 0.75)
}))
// engine.addEntity(spaceSkybox)





// Check when player is on the spaceship in the space center to begin loading in next level: outer space
let gamePhase = 0
const camera = Camera.instance

function distance(pos1: Vector3, pos2: Vector3): number {
    const a = pos1.x - pos2.x
    const b = pos1.z - pos2.z
    let c = pos1.y - pos2.y
    c = c * c
    if (c > 100000) {
        c = 1000 // Clamp to 1000 max
    } else {
        c = 0
    }
    return a * a + b * b + c
}

function StartPhaseThree() {
  gamePhase++

  engine.addEntity(spaceship)
  engine.addEntity(spaceSkybox)
  engine.removeEntity(spaceCenter)

  // Adds systems to the engine
  engine.addSystem(new MovingShips())

  // Spawn 4 enemy ships
  SpawnShips(4, 8, 0);

  // Move Kat up to the ship
  Kat.getComponent(Transform).translate(new Vector3(0,1,5))
  Kat.getComponent(Transform).rotate(new Vector3(0,1,0), -90)

  // Play Kat voice
  voice4.getComponent(AudioSource).playOnce()

  // BGM
  audioSource.playing = false
  soundtrack.getComponent(AudioSource).playOnce()
}

class DistanceCheck {
  update() {
      let spaceShipTransform = new Vector3(0,0,0)
      let dist = distance(spaceShipTransform, camera.position)

      let x = camera.position.x
      let y = camera.position.y
      let z = camera.position.z

      if (x > 19 && x < 26 && z > 9 && z < 14 && gamePhase == 0)
      {
        voice1.getComponent(AudioSource).playOnce()
        gamePhase++
      }

      if (x > 17 && x < 28 && z > 16 && z < 20 && gamePhase == 1)
      {
        tick = 1
        gamePhase++
      }

      if (tick == 1)
      {
        tock++
        if (tock > 64)
        {
          voice2.getComponent(AudioSource).playOnce()
          tick = 0
        }
      }

      //log('phase: ' + gamePhase)

      // Player gets on the Ship to begin next phase
      if (x < 25 && x > 22 && y > 2.8 && z > 24 && z < 27 && gamePhase == 2)
      {
        timer++
        if (timer >= 16)
          StartPhaseThree()
      }
  }
}

class MainGameLoop {
  update() {

    //log("kills: " + killsThisRound)

    if (gamePhase == 3) // Space shooting game has begun
    {
      lvlTxt.value = "LEVEL 1 of 5"
      remainingTxt.value = "ENEMIES LEFT: " + (4 - killsThisRound)
      if (killsThisRound >= 4)
      {
        killsThisRound = 0
        gamePhase++
        SpawnShips(7, 8, 0)
        voice5.getComponent(AudioSource).playOnce()
      }
    }

    if (gamePhase == 4) // Next round
    {
      lvlTxt.value = "LEVEL 2 of 5"
      remainingTxt.value = "ENEMIES LEFT: " + (7 - killsThisRound)
      if (killsThisRound >= 7)
      {
        killsThisRound = 0
        gamePhase++
        SpawnShips(10, 8, 0)
        voice6.getComponent(AudioSource).playOnce()
      }
    }

    if (gamePhase == 5) // Next round
    {
      lvlTxt.value = "LEVEL 3 of 5"
      remainingTxt.value = "ENEMIES LEFT: " + (10 - killsThisRound)
      if (killsThisRound >= 10)
      {
        speed = 1.5
        killsThisRound = 0
        gamePhase++
        SpawnShips(10, 8, 0)
        SpawnShips(8, 12, 0)
        SpawnShips(6, 16, 0)
        voice7.getComponent(AudioSource).playOnce()
      }
    }

    if (gamePhase == 6) // Next round
    {
      lvlTxt.value = "LEVEL 4 of 5"
      remainingTxt.value = "ENEMIES LEFT: " + (24 - killsThisRound)
      if (killsThisRound >= 24)
      {
        speed = 1.0
        killsThisRound = 0
        gamePhase++
        SpawnShips(5, 8, 0)
        SpawnShips(1, 12, 1)
        SpawnShips(5, 16, 0)
        voice11.getComponent(AudioSource).playOnce()
      }
    }

    if (gamePhase == 7) // Won
    {
      lvlTxt.value = "LEVEL 5 of 5"
      remainingTxt.value = "ENEMIES LEFT: " + (11 - killsThisRound)
      if (killsThisRound >= 11 && playerHealth > 0)
      {
        voice10.getComponent(AudioSource).playOnce()
        gamePhase++
        lvlTxt.value = "WON!"
      }
    }

  }
}

// Checks distance to space ship to begin phase 2 (game start in outer space)
engine.addSystem(new DistanceCheck())

// Main game loop for outer space shooter
engine.addSystem(new MainGameLoop())



// Kat your NPC helper
let Kat = new Entity()
Kat.addComponent(new GLTFShape("models/Kat.glb"))
Kat.addComponent(new Transform({
  position: new Vector3(21.6, 0, 22),
  scale:new Vector3(0.5, 0.5, 0.5),
  rotation:new Quaternion(0,1.1,0,1)
}))

engine.addEntity(Kat)

//-------------------------------------------------------
// UI

// Canvas

const canvas = new UICanvas()
const rect = new UIContainerRect(canvas)
rect.adaptHeight = true
rect.adaptWidth = true
rect.hAlign = 'left'
rect.vAlign = 'bottom'
rect.opacity = 0.8

// Player Health
let healthHeartTexture = new Texture("images/heart.png")

const heart1 = new UIImage(rect, healthHeartTexture)
heart1.hAlign = 'left'
heart1.vAlign = 'bottom'
heart1.sourceWidth = 1024
heart1.sourceHeight = 1024
heart1.width = 256
heart1.height = 256
heart1.positionX = 20
heart1.positionY = -200

const heart2 = new UIImage(rect, healthHeartTexture)
heart2.hAlign = 'left'
heart2.vAlign = 'bottom'
heart2.sourceWidth = 1024
heart2.sourceHeight = 1024
heart2.width = 256
heart2.height = 256
heart2.positionX = 60
heart2.positionY = -200

const heart3 = new UIImage(rect, healthHeartTexture)
heart3.hAlign = 'left'
heart3.vAlign = 'bottom'
heart3.sourceWidth = 1024
heart3.sourceHeight = 1024
heart3.width = 256
heart3.height = 256
heart3.positionX = 100
heart3.positionY = -200

const heart4 = new UIImage(rect, healthHeartTexture)
heart4.hAlign = 'left'
heart4.vAlign = 'bottom'
heart4.sourceWidth = 1024
heart4.sourceHeight = 1024
heart4.width = 256
heart4.height = 256
heart4.positionX = 140
heart4.positionY = -200

const heart5 = new UIImage(rect, healthHeartTexture)
heart5.hAlign = 'left'
heart5.vAlign = 'bottom'
heart5.sourceWidth = 1024
heart5.sourceHeight = 1024
heart5.width = 256
heart5.height = 256
heart5.positionX = 180
heart5.positionY = -200


// LEVEL TEXT

const lvlTxt = new UIText(canvas)
lvlTxt.value = "LEVEL 1/5"
lvlTxt.fontSize = 24
lvlTxt.width = 120
lvlTxt.height = 30
lvlTxt.hAlign = 'left'
lvlTxt.vAlign = "bottom"
lvlTxt.positionX = 25
lvlTxt.positionY = 100

const remainingTxt = new UIText(canvas)
remainingTxt.value = "ENEMIES: "
remainingTxt.fontSize = 24
remainingTxt.width = 120
remainingTxt.height = 30
remainingTxt.hAlign = 'left'
remainingTxt.vAlign = "bottom"
remainingTxt.positionX = 25
remainingTxt.positionY = 70


//-------------------------------------------------------
// AUDIO

var audioEnt = new Entity("AudioSource")
engine.addEntity(audioEnt)
audioEnt.addComponent(new Transform({ position: new Vector3(8, 1, 8) }))
audioEnt.getComponent(Transform).rotation.set(0, 0, 0, 1)
audioEnt.getComponent(Transform).scale.set(1, 1, 1)

var audioSource = new AudioSource(new AudioClip('audio/tech.wav'))
var playAudioSource1 = () => {
  audioEnt.addComponent(audioSource)
  audioSource.playing = true
  audioSource.loop = true
  audioSource.volume = 1
  audioSource.pitch = 1
}

const soundtrack = new Entity()
soundtrack.addComponent(new AudioSource(new AudioClip("audio/AnotherWorld.mp3")))
soundtrack.addComponent(new Transform())
soundtrack.getComponent(Transform).position = Camera.instance.position
soundtrack.getComponent(AudioSource).volume = 0.5
engine.addEntity(soundtrack)

export class AutoPlayUnityAudio implements ISystem {
  activate() {
    playAudioSource1()
  }
}

// Play background music
engine.addSystem(new AutoPlayUnityAudio())

// Sound Effects
const gunShot = new Entity()
gunShot.addComponent(new AudioSource(new AudioClip("audio/laser1.wav")))
gunShot.addComponent(new Transform())
gunShot.getComponent(Transform).position = Camera.instance.position
engine.addEntity(gunShot)

const explosionSound = new Entity()
explosionSound.addComponent(new AudioSource(new AudioClip("audio/boom.wav")))
explosionSound.addComponent(new Transform())
explosionSound.getComponent(Transform).position = Camera.instance.position
engine.addEntity(explosionSound)

// Voice

const voice1 = new Entity()
voice1.addComponent(new AudioSource(new AudioClip("audio/voice/heretohelpyou.mp3")))
voice1.addComponent(new Transform())
voice1.getComponent(Transform).position = Camera.instance.position
engine.addEntity(voice1)

const voice2 = new Entity()
voice2.addComponent(new AudioSource(new AudioClip("audio/voice/illbeyourguidegoforward.mp3")))
voice2.addComponent(new Transform())
voice2.getComponent(Transform).position = Camera.instance.position
engine.addEntity(voice2)

const voice3 = new Entity()
voice3.addComponent(new AudioSource(new AudioClip("audio/voice/goforward.mp3")))
voice3.addComponent(new Transform())
voice3.getComponent(Transform).position = Camera.instance.position
engine.addEntity(voice3)

const voice4 = new Entity()
voice4.addComponent(new AudioSource(new AudioClip("audio/voice/theyrecoming.mp3")))
voice4.addComponent(new Transform())
voice4.getComponent(Transform).position = Camera.instance.position
engine.addEntity(voice4)

const voice5 = new Entity()
voice5.addComponent(new AudioSource(new AudioClip("audio/voice/shoot.mp3")))
voice5.addComponent(new Transform())
voice5.getComponent(Transform).position = Camera.instance.position
engine.addEntity(voice5)

const voice6 = new Entity()
voice6.addComponent(new AudioSource(new AudioClip("audio/voice/weshowedthem.mp3")))
voice6.addComponent(new Transform())
voice6.getComponent(Transform).position = Camera.instance.position
engine.addEntity(voice6)

const voice7 = new Entity()
voice7.addComponent(new AudioSource(new AudioClip("audio/voice/idontlikethelookofthis.mp3")))
voice7.addComponent(new Transform())
voice7.getComponent(Transform).position = Camera.instance.position
engine.addEntity(voice7)

const voice8 = new Entity()
voice8.addComponent(new AudioSource(new AudioClip("audio/voice/wellgetthosebastardsnexttime.mp3")))
voice8.addComponent(new Transform())
voice8.getComponent(Transform).position = Camera.instance.position
engine.addEntity(voice8)

const voice9 = new Entity()
voice9.addComponent(new AudioSource(new AudioClip("audio/voice/watchout.mp3")))
voice9.addComponent(new Transform())
voice9.getComponent(Transform).position = Camera.instance.position
engine.addEntity(voice9)

const voice10 = new Entity()
voice10.addComponent(new AudioSource(new AudioClip("audio/voice/wewon.mp3")))
voice10.addComponent(new Transform())
voice10.getComponent(Transform).position = Camera.instance.position
engine.addEntity(voice10)

const voice11 = new Entity()
voice11.addComponent(new AudioSource(new AudioClip("audio/voice/youvegotthisundercontrol.mp3")))
voice11.addComponent(new Transform())
voice11.getComponent(Transform).position = Camera.instance.position
engine.addEntity(voice11)