/**
 * Created by ghassaei on 9/16/16.
 */

var nodeMaterial = new THREE.MeshBasicMaterial({color: 0x000000, side:THREE.DoubleSide});

var transparentMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, opacity:0.5, transparent:true});
var transparentVRMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, opacity:0.8, transparent:true});

var nodeGeo = new THREE.SphereGeometry(0.02,20);

function Node(position, index){

    this.type = "node";
    this.index = index;
    this._originalPosition = position.clone();

    this.beams = [];
    this.creases = [];
    this.invCreases = [];
    this.externalForce = null;
    this.fixed = false;
    this.magnetized = 0;


    this.mag = null;
    this.magDefault = true;
    // this.render(new THREE.Vector3(0,0,0));
    this.magToNode = null;
}

Node.prototype.setFixed = function(fixed){
    this.fixed = fixed;
    if (fixed) {
        globals.model.getHighlights()[this.getIndex()].material.opacity = 1;
    }
    else {
        if (!this.magnetized) {
            globals.model.getHighlights()[this.getIndex()].material.opacity = 0;
        }

    }
    // if (fixed) {
    //     this.object3D.material = nodeMaterialFixed;
    //     this.object3D.geometry = nodeFixedGeo;
    //     if (this.externalForce) this.externalForce.hide();
    // }
    // else {
    //     this.object3D.material = nodeMaterial;
    //     this.object3D.geometry = nodeGeo;
    //     if (this.externalForce) this.externalForce.show();
    // }
};

Node.prototype.isFixed = function(){
    return this.fixed;
};


Node.prototype.setMagnetized= function(val) {
    this.magnetized = val;
    if (globals.magDirection) {
        this.magDefault = false;
        this.mag = globals.magDirection.clone();
    }
    if (val) {
        globals.model.getHighlights()[this.getIndex()].material.opacity = 1;
        globals.model.getHighlights()[this.getIndex()].material.color.setHex(0xff0000);
        if (this.magToNode != null) {
            globals.model.getArrows()[this.getIndex()].setLength(1, 0.2, 0.02);
        }
    } 
    else {
        globals.model.getHighlights()[this.getIndex()].material.opacity = 0;
        globals.model.getHighlights()[this.getIndex()].material.color.setHex(0x00ff00);
        globals.model.getArrows()[this.getIndex()].setLength(0.001, 0.0002, 0.00002);
    }
};

//forces
//Mag Integration Comment: addition of external force removed by creator?
Node.prototype.addExternalForce = function(force){
    // this.externalForce = force;
    // var position = this.getOriginalPosition();
    // this.externalForce.setOrigin(position);
    // if (this.fixed) this.externalForce.hide();
};
//Mag Integration Comment: this.externalForce is never set, always returns 0 vector
Node.prototype.getExternalForce = function(){
    if (!this.externalForce) return new THREE.Vector3(0,0,0);
    return this.externalForce.getForce();
};

Node.prototype.getMagneticForce = function() {
    if (globals.model.magNode == this.getIndex()) {
        return new THREE.Vector3(0,0,0);
    }
    otherNode = globals.model.getNodes()[globals.model.magNode];
    otherNode.mag = this.getPosition().sub(otherNode.getPosition()).normalize();
    if (this.magDefault) {
        this.mag = otherNode.mag.multiplyScalar(-1);
    }
    if (this.magToNode != null) {
        this.mag = globals.model.getNodes()[this.magToNode].getPosition().clone().sub(this.getPosition());
    }
    p = new THREE.Vector3(this.getPosition().x - (otherNode.getPosition().x),
        this.getPosition().y - otherNode.getPosition().y,
        this.getPosition().z - otherNode.getPosition().z);
    p_unit = p.clone().normalize();
    //console.log(otherNode);
    //onsole.log(this);
    m1 = this.mag;
    m2 = otherNode.mag;

    K = (3.0*Math.pow(0.1, 7)) / Math.pow(p.length(), 4);

    f1 = m2.multiplyScalar(m1.dot(p_unit)*K);
    f2 = m1.multiplyScalar(m2.dot(p_unit));
    f3 = p_unit.multiplyScalar(m1.dot(m2));
    f4 = p_unit.multiplyScalar(m1.dot(p_unit)*m2.dot(p_unit)*5);
    f1.add(f2).add(f3).sub(f4);
    var ret = f1.multiplyScalar(globals.magStrength*50000).multiplyScalar(this.magnetized);
    //globals.model.getHighlights()[this.getIndex()]
    //globals.model.getArrows()[this.getIndex()].setDirection(ret.clone().normalize());
    this.setDirection(this.mag.clone().normalize());
    globals.model.getArrows()[this.getIndex()].setDirection(ret.clone().normalize());
    return ret;
}

Node.prototype.getMagneticForceCall = function() {
    if (globals.model.magNode == this.getIndex()) {
        return new THREE.Vector3(0,0,0);
    }
    otherNode = globals.model.getNodes()[globals.model.magNode];
    otherNode.mag = this.getPosition().sub(otherNode.getPosition()).normalize();
    if (this.magDefault) {
        this.mag = otherNode.mag.multiplyScalar(-1);
    }
    if (this.magToNode != null) {
        this.mag = globals.model.getNodes()[this.magToNode].getPosition().clone().sub(this.getPosition());
    }
    p = new THREE.Vector3(this.getPosition().x - (otherNode.getPosition().x),
        this.getPosition().y - otherNode.getPosition().y,
        this.getPosition().z - otherNode.getPosition().z);
    p_unit = p.clone().normalize();
    //console.log(otherNode);
    //onsole.log(this);
    m1 = this.mag;
    m2 = otherNode.mag;

    K = (3.0*Math.pow(0.1, 7)) / Math.pow(p.length(), 4);

    f1 = m2.multiplyScalar(m1.dot(p_unit)*K);
    f2 = m1.multiplyScalar(m2.dot(p_unit));
    f3 = p_unit.multiplyScalar(m1.dot(m2));
    f4 = p_unit.multiplyScalar(m1.dot(p_unit)*m2.dot(p_unit)*5);
    f1.add(f2).add(f3).sub(f4);
    var ret = f1.multiplyScalar(globals.magStrength*50000).multiplyScalar(this.magnetized);
    //globals.model.getHighlights()[this.getIndex()]
    //globals.model.getArrows()[this.getIndex()].setDirection(ret.clone().normalize());
    console.log(this.mag);
    setDirection(this.mag.clone().normalize());
    return ret;
}

Node.prototype.setDirection = function ( dir ) {

    var arrow = globals.model.getHighlights()[this.getIndex()];
    const _axis = new THREE.Vector3();

	// dir is assumed to be normalized

	if ( dir.y > 0.99999 ) {

		arrow.quaternion.set( 0, 0, 0, 1 );

	} else if ( dir.y < - 0.99999 ) {

		arrow.quaternion.set( 1, 0, 0, 0 );

	} else {

		_axis.set( dir.z, 0, - dir.x ).normalize();

		const radians = Math.acos( dir.y );

		arrow.quaternion.setFromAxisAngle( _axis, radians );

	}

};

Node.prototype.addCrease = function(crease){
    this.creases.push(crease);
};

Node.prototype.removeCrease = function(crease){
    if (this.creases === null) return;
    var index = this.creases.indexOf(crease);
    if (index>=0) this.creases.splice(index, 1);
};

Node.prototype.addInvCrease = function(crease){
    this.invCreases.push(crease);
};

Node.prototype.removeInvCrease = function(crease){
    if (this.invCreases === null) return;
    var index = this.invCreases.indexOf(crease);
    if (index>=0) this.invCreases.splice(index, 1);
};


Node.prototype.addBeam = function(beam){
    this.beams.push(beam);
};

Node.prototype.removeBeam = function(beam){
    if (this.beams === null) return;
    var index = this.beams.indexOf(beam);
    if (index>=0) this.beams.splice(index, 1);
};

Node.prototype.getBeams = function(){
    return this.beams;
};

Node.prototype.numBeams = function(){
    return this.beams.length;
};

Node.prototype.isConnectedTo = function(node){
    for (var i=0;i<this.beams.length;i++){
        if (this.beams[i].getOtherNode(this) == node) return true;
    }
    return false;
};

Node.prototype.numCreases = function(){
    return this.creases.length;
};

Node.prototype.getIndex = function(){//in nodes array
    return this.index;
};

Node.prototype.getObject3D = function(){
    return this.object3D;
};

// Node.prototype.highlight = function(){
//     this.object3D.material = nodeMaterialHighlight;
// };
//
// Node.prototype.unhighlight = function(){
//     if (!this.object3D) return;
//     if (this.fixed) {
//         this.object3D.material = nodeMaterialFixed;
//     }
//     else {
//         this.object3D.material = nodeMaterial;
//     }
// };

Node.prototype.setTransparent = function(){
    if (!this.object3D){
        this.object3D = new THREE.Mesh(nodeGeo, nodeMaterial);
        this.object3D.visible = false;
    }
    this.object3D.material = transparentMaterial;
};

Node.prototype.setTransparentVR = function(){
    if (!this.object3D){
        this.object3D = new THREE.Mesh(nodeGeo, nodeMaterial);
        this.object3D.visible = false;
    }
    this.object3D.material = transparentVRMaterial;
    this.object3D.scale.set(0.4, 0.4, 0.4);
};

// Node.prototype.hide = function(){
//     this.object3D.visible = false;
// };

// Node.prototype.render = function(position){
    // if (this.fixed) return;
    // position.add(this.getOriginalPosition());
    // console.log(position);
    // this.object3D.position.set(position.x, position.y, position.z);
    // return position;
// };
// Node.prototype.renderDelta = function(delta){
//     // if (this.fixed) return;
//     this.object3D.position.add(delta);
//     return this.object3D.position;
// };

// Node.prototype.renderChange = function(change){
//     this.object3D.position.add(change);
// };








//dynamic solve

Node.prototype.getOriginalPosition = function(){
    return this._originalPosition.clone();
};
Node.prototype.setOriginalPosition = function(x, y, z){
    this._originalPosition.set(x, y, z);
};

Node.prototype.getPosition = function(){
    var positions = globals.model.getPositionsArray();
    var i = this.getIndex();
    return new THREE.Vector3(positions[3*i], positions[3*i+1], positions[3*i+2]);
};

Node.prototype.moveManually = function(position){
    var positions = globals.model.getPositionsArray();
    var i = this.getIndex();
    positions[3*i] = position.x;
    positions[3*i+1] = position.y;
    positions[3*i+2] = position.z;
};

Node.prototype.getRelativePosition = function(){
    return this.getPosition().sub(this._originalPosition);
};

Node.prototype.getSimMass = function(){
    return 1;
};





//deallocate

Node.prototype.destroy = function(){
    //object3D is removed in outer scope
    this.object3D = null;
    this.beams = null;
    this.creases = null;
    this.invCreases = null;
    this.externalForce = null;
};