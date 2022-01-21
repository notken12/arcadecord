import { ExtendedObject3D, Scene3D } from "enable3d"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

export class Table {
    static PLAY_AREA = {
        LEN_Z: 223.52, // cm
        LEN_X: 111.76  // cm
    }

    scene: Scene3D

    constructor(scene: Scene3D) {
        this.scene = scene;

        const loader = new GLTFLoader()
        loader.load('/dist/3d_models/table.glb', gltf => {

            const meshes = gltf.scene.children.filter(child => {
                return child.type == 'Mesh'
            })
            for (let mesh of meshes) {
                // if (mesh.name != 'Table_Bed')
                // return;
                let object = new ExtendedObject3D()
                object.add(mesh)
                object.castShadow = false
                object.receiveShadow = true
                if (mesh.name == 'Table_Bed') {
                    this.scene.physics.add.existing(object, { shape: 'box', width: Table.PLAY_AREA.LEN_X, height: 1, depth: Table.PLAY_AREA.LEN_Z })
                    object.body.setCollisionFlags(2)
                } else {
                    this.scene.physics.add.existing(object, { shape: 'convex' })
                    object.body.setCollisionFlags(2)
                }
                object.body.skipUpdate = true
            }
        })
    }
}