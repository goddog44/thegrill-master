import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Users, CheckCircle, RotateCcw, ZoomIn, ZoomOut, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSound } from '../hooks/useSound';

export interface RestaurantTable {
  id: string;
  table_number: number;
  zone: string;
  capacity: number;
  position_x: number;
  position_y: number;
  is_available: boolean;
}

interface Restaurant3DMapProps {
  onSelectTable: (table: RestaurantTable) => void;
  selectedTableId?: string;
}

export const Restaurant3DMap = ({ onSelectTable, selectedTableId }: Restaurant3DMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const tableMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'3d' | 'top'>('3d');

  const playClick = useSound('/sounds/click3.mp3');
  const playSelect = useSound('/sounds/click4.mp3');

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurant_tables')
        .select('*')
        .order('table_number');

      if (error) throw error;
      setTables(data || []);
    } catch (error) {
      console.error('Erreur de chargement des tables:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!containerRef.current || loading) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.Fog(0x1a1a2e, 20, 50);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(15, 15, 15);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.2;
    controls.minDistance = 8;
    controls.maxDistance = 30;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    setupLights(scene);
    createFloor(scene);
    createWalls(scene);
    createTables(scene, tables);
    createDecorations(scene);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      
      tableMeshesRef.current.forEach((group, tableId) => {
        if (tableId === selectedTableId) {
          group.position.y = 0.1 + Math.sin(Date.now() * 0.003) * 0.05;
        } else if (tableId === hoveredTable) {
          group.position.y = 0.05;
        } else {
          group.position.y = 0;
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      checkTableHover();
    };

    const handleClick = () => {
      if (hoveredTable) {
        const table = tables.find(t => t.id === hoveredTable);
        if (table && table.is_available) {
          playSelect();
          onSelectTable(table);
        }
      }
    };

    containerRef.current.addEventListener('mousemove', handleMouseMove);
    containerRef.current.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
        containerRef.current.removeEventListener('click', handleClick);
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [tables, loading]);

  useEffect(() => {
    updateTableSelection();
  }, [selectedTableId, hoveredTable]);

  const checkTableHover = () => {
    if (!cameraRef.current || !sceneRef.current) return;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(sceneRef.current.children, true);

    let foundTable: string | null = null;
    for (const intersect of intersects) {
      let obj = intersect.object;
      while (obj.parent) {
        if (obj.userData.tableId) {
          foundTable = obj.userData.tableId;
          break;
        }
        obj = obj.parent;
      }
      if (foundTable) break;
    }

    if (foundTable !== hoveredTable) {
      setHoveredTable(foundTable);
    }
  };

  const updateTableSelection = () => {
    tableMeshesRef.current.forEach((group, tableId) => {
      const table = tables.find(t => t.id === tableId);
      if (!table) return;

      const tableMesh = group.children.find(c => c.name === 'tableTop') as THREE.Mesh;
      if (!tableMesh) return;

      const material = tableMesh.material as THREE.MeshStandardMaterial;
      
      if (tableId === selectedTableId) {
        material.emissive = new THREE.Color(0x10b981);
        material.emissiveIntensity = 0.5;
      } else if (tableId === hoveredTable && table.is_available) {
        material.emissive = new THREE.Color(0x3b82f6);
        material.emissiveIntensity = 0.3;
      } else {
        material.emissive = new THREE.Color(0x000000);
        material.emissiveIntensity = 0;
      }
    });
  };

  const setupLights = (scene: THREE.Scene) => {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffeedd, 1);
    mainLight.position.set(10, 20, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -20;
    mainLight.shadow.camera.right = 20;
    mainLight.shadow.camera.top = 20;
    mainLight.shadow.camera.bottom = -20;
    scene.add(mainLight);

    const pointLight1 = new THREE.PointLight(0xffa500, 0.8, 15);
    pointLight1.position.set(-5, 5, -5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x10b981, 0.6, 15);
    pointLight2.position.set(5, 5, 5);
    scene.add(pointLight2);

    const spotLight = new THREE.SpotLight(0xffffff, 0.5);
    spotLight.position.set(0, 15, 0);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    spotLight.castShadow = true;
    scene.add(spotLight);
  };

  const createFloor = (scene: THREE.Scene) => {
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x2d2d2d,
      roughness: 0.8,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const terrasseGeometry = new THREE.PlaneGeometry(12, 8);
    const terrasseMaterial = new THREE.MeshStandardMaterial({
      color: 0x228b22,
      roughness: 0.9,
      metalness: 0.1,
    });
    const terrasse = new THREE.Mesh(terrasseGeometry, terrasseMaterial);
    terrasse.rotation.x = -Math.PI / 2;
    terrasse.position.set(-4, 0.01, 8);
    terrasse.receiveShadow = true;
    scene.add(terrasse);

    const vipGeometry = new THREE.PlaneGeometry(6, 8);
    const vipMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a0080,
      roughness: 0.7,
      metalness: 0.3,
    });
    const vip = new THREE.Mesh(vipGeometry, vipMaterial);
    vip.rotation.x = -Math.PI / 2;
    vip.position.set(7, 0.01, 8);
    vip.receiveShadow = true;
    scene.add(vip);

    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x333333);
    gridHelper.position.y = 0.02;
    scene.add(gridHelper);
  };

  const createWalls = (scene: THREE.Scene) => {
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d3d3d,
      roughness: 0.9,
      metalness: 0.1,
    });

    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(20, 4, 0.3),
      wallMaterial
    );
    backWall.position.set(0, 2, -10);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    scene.add(backWall);

    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 4, 20),
      wallMaterial
    );
    leftWall.position.set(-10, 2, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    const barGeometry = new THREE.BoxGeometry(8, 1.2, 1.5);
    const barMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.5,
      metalness: 0.3,
    });
    const bar = new THREE.Mesh(barGeometry, barMaterial);
    bar.position.set(0, 0.6, -8);
    bar.castShadow = true;
    bar.receiveShadow = true;
    scene.add(bar);

    createNeonSign(scene);
  };

  const createNeonSign = (scene: THREE.Scene) => {
    const textGeometry = new THREE.BoxGeometry(6, 0.8, 0.1);
    const neonMaterial = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 2,
    });
    const sign = new THREE.Mesh(textGeometry, neonMaterial);
    sign.position.set(0, 3.5, -9.8);
    scene.add(sign);

    const glowLight = new THREE.PointLight(0x10b981, 2, 8);
    glowLight.position.set(0, 3.5, -8);
    scene.add(glowLight);
  };

  const createTables = (scene: THREE.Scene, tables: RestaurantTable[]) => {
    tableMeshesRef.current.clear();

    tables.forEach(table => {
      const group = new THREE.Group();
      group.userData.tableId = table.id;

      const x = (table.position_x / 100) * 16 - 8;
      const z = (table.position_y / 100) * 16 - 8;

      let tableColor = 0x8b4513;
      if (table.zone === 'terrasse') tableColor = 0x228b22;
      else if (table.zone === 'vip') tableColor = 0x6b21a8;

      const tableTopGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.1, 32);
      const tableTopMaterial = new THREE.MeshStandardMaterial({
        color: table.is_available ? tableColor : 0x555555,
        roughness: 0.3,
        metalness: 0.5,
      });
      const tableTop = new THREE.Mesh(tableTopGeometry, tableTopMaterial);
      tableTop.name = 'tableTop';
      tableTop.position.y = 0.8;
      tableTop.castShadow = true;
      tableTop.receiveShadow = true;
      group.add(tableTop);

      const legGeometry = new THREE.CylinderGeometry(0.1, 0.15, 0.8, 16);
      const legMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.5,
        metalness: 0.7,
      });
      const leg = new THREE.Mesh(legGeometry, legMaterial);
      leg.position.y = 0.4;
      leg.castShadow = true;
      group.add(leg);

      const chairCount = Math.min(table.capacity, 4);
      for (let i = 0; i < chairCount; i++) {
        const angle = (i / chairCount) * Math.PI * 2;
        const chairX = Math.cos(angle) * 1.2;
        const chairZ = Math.sin(angle) * 1.2;
        
        const chair = createChair();
        chair.position.set(chairX, 0, chairZ);
        chair.rotation.y = -angle + Math.PI;
        group.add(chair);
      }

      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = table.is_available ? '#10b981' : '#666666';
      ctx.beginPath();
      ctx.arc(32, 32, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(table.table_number.toString(), 32, 32);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.y = 1.5;
      sprite.scale.set(0.6, 0.6, 1);
      group.add(sprite);

      group.position.set(x, 0, z);
      scene.add(group);
      tableMeshesRef.current.set(table.id, group);
    });
  };

  const createChair = (): THREE.Group => {
    const chair = new THREE.Group();

    const seatGeometry = new THREE.BoxGeometry(0.4, 0.05, 0.4);
    const chairMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a4a4a,
      roughness: 0.6,
      metalness: 0.4,
    });
    
    const seat = new THREE.Mesh(seatGeometry, chairMaterial);
    seat.position.y = 0.45;
    seat.castShadow = true;
    chair.add(seat);

    const backGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.05);
    const back = new THREE.Mesh(backGeometry, chairMaterial);
    back.position.set(0, 0.65, -0.175);
    back.castShadow = true;
    chair.add(back);

    const legGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.45, 8);
    const legMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222,
      metalness: 0.8,
    });

    const positions = [
      [-0.15, 0.225, -0.15],
      [0.15, 0.225, -0.15],
      [-0.15, 0.225, 0.15],
      [0.15, 0.225, 0.15],
    ];

    positions.forEach(pos => {
      const leg = new THREE.Mesh(legGeometry, legMaterial);
      leg.position.set(pos[0], pos[1], pos[2]);
      chair.add(leg);
    });

    return chair;
  };

  const createDecorations = (scene: THREE.Scene) => {
    const plantPositions = [
      [-9, 0, -9],
      [9, 0, -9],
      [-9, 0, 5],
    ];

    plantPositions.forEach(pos => {
      const plant = createPlant();
      plant.position.set(pos[0], pos[1], pos[2]);
      scene.add(plant);
    });

    const lampPositions = [
      [0, 4, 0],
      [-5, 4, 0],
      [5, 4, 0],
    ];

    lampPositions.forEach(pos => {
      const lamp = createHangingLamp();
      lamp.position.set(pos[0], pos[1], pos[2]);
      scene.add(lamp);

      const light = new THREE.PointLight(0xffa500, 0.5, 8);
      light.position.set(pos[0], pos[1] - 0.5, pos[2]);
      scene.add(light);
    });
  };

  const createPlant = (): THREE.Group => {
    const plant = new THREE.Group();

    const potGeometry = new THREE.CylinderGeometry(0.3, 0.25, 0.5, 16);
    const potMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.8,
    });
    const pot = new THREE.Mesh(potGeometry, potMaterial);
    pot.position.y = 0.25;
    pot.castShadow = true;
    plant.add(pot);

    const foliageGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const foliageMaterial = new THREE.MeshStandardMaterial({
      color: 0x228b22,
      roughness: 0.9,
    });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = 0.9;
    foliage.scale.set(1, 1.5, 1);
    foliage.castShadow = true;
    plant.add(foliage);

    return plant;
  };

  const createHangingLamp = (): THREE.Group => {
    const lamp = new THREE.Group();

    const cableGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1, 8);
    const cableMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const cable = new THREE.Mesh(cableGeometry, cableMaterial);
    cable.position.y = 0.5;
    lamp.add(cable);

    const shadeGeometry = new THREE.ConeGeometry(0.4, 0.3, 16, 1, true);
    const shadeMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      side: THREE.DoubleSide,
    });
    const shade = new THREE.Mesh(shadeGeometry, shadeMaterial);
    shade.rotation.x = Math.PI;
    lamp.add(shade);

    const bulbGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const bulbMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffa500,
      emissiveIntensity: 1,
    });
    const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
    bulb.position.y = -0.1;
    lamp.add(bulb);

    return lamp;
  };

  const resetCamera = () => {
    playClick();
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(15, 15, 15);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  const zoomIn = () => {
    playClick();
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(0.8);
    }
  };

  const zoomOut = () => {
    playClick();
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(1.2);
    }
  };

  const toggleView = () => {
    playClick();
    if (cameraRef.current && controlsRef.current) {
      if (viewMode === '3d') {
        cameraRef.current.position.set(0, 25, 0.1);
        controlsRef.current.target.set(0, 0, 0);
        setViewMode('top');
      } else {
        cameraRef.current.position.set(15, 15, 15);
        controlsRef.current.target.set(0, 0, 0);
        setViewMode('3d');
      }
      controlsRef.current.update();
    }
  };

  const getZoneLabel = (zone: string) => {
    switch (zone) {
      case 'interieur': return 'Intérieur';
      case 'terrasse': return 'Terrasse';
      case 'vip': return 'VIP';
      default: return zone;
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-xl shadow-lg p-6 flex justify-center items-center" style={{ height: '500px' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white font-medium">Chargement de la carte 3D...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-2xl overflow-hidden">
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600/20 p-2 rounded-lg">
            <Users className="text-emerald-400" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Plan du Restaurant 3D</h2>
            <p className="text-gray-400 text-sm">Cliquez sur une table pour la sélectionner</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleView}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
            title={viewMode === '3d' ? 'Vue du dessus' : 'Vue 3D'}
          >
            <Eye size={20} />
          </button>
          <button
            onClick={zoomIn}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
            title="Zoom +"
          >
            <ZoomIn size={20} />
          </button>
          <button
            onClick={zoomOut}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
            title="Zoom -"
          >
            <ZoomOut size={20} />
          </button>
          <button
            onClick={resetCamera}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
            title="Réinitialiser la vue"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      <div className="px-4 py-2 bg-gray-800/50 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-800 rounded"></div>
          <span className="text-sm text-gray-300">Intérieur</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-700 rounded"></div>
          <span className="text-sm text-gray-300">Terrasse</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-700 rounded"></div>
          <span className="text-sm text-gray-300">VIP</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-600 rounded"></div>
          <span className="text-sm text-gray-300">Occupée</span>
        </div>
      </div>

      <div 
        ref={containerRef} 
        className="w-full cursor-grab active:cursor-grabbing"
        style={{ height: '450px' }}
      />

      <div className="p-4 border-t border-gray-700">
        {selectedTableId ? (
          <div className="flex items-center justify-between bg-emerald-900/30 border border-emerald-500/50 rounded-lg p-4">
            {(() => {
              const selected = tables.find(t => t.id === selectedTableId);
              return selected ? (
                <>
                  <div>
                    <p className="text-lg font-bold text-white">
                      Table #{selected.table_number}
                    </p>
                    <p className="text-sm text-gray-300">
                      Zone: {getZoneLabel(selected.zone)} • Capacité: {selected.capacity} personnes
                    </p>
                  </div>
                  <CheckCircle className="text-emerald-500" size={32} />
                </>
              ) : null;
            })()}
          </div>
        ) : hoveredTable ? (
          <div className="flex items-center justify-between bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
            {(() => {
              const hovered = tables.find(t => t.id === hoveredTable);
              return hovered ? (
                <div>
                  <p className="text-lg font-bold text-white">
                    Table #{hovered.table_number}
                  </p>
                  <p className="text-sm text-gray-300">
                    {hovered.is_available 
                      ? 'Cliquez pour sélectionner' 
                      : 'Table occupée'}
                  </p>
                </div>
              ) : null;
            })()}
          </div>
        ) : (
          <p className="text-gray-400 text-center">
            🖱️ Survolez une table pour voir les détails • Utilisez la souris pour naviguer en 3D
          </p>
        )}
      </div>
    </div>
  );
};