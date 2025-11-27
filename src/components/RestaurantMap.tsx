import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { 
  Users, CheckCircle, RotateCcw, ZoomIn, ZoomOut, Eye, Sparkles,
  Home, TreePine, Crown, Armchair, MousePointerClick, XCircle, Ban
} from 'lucide-react';
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
  const animationRef = useRef<number>(0);
  
  const hoveredTableRef = useRef<string | null>(null);
  const tablesRef = useRef<RestaurantTable[]>([]);

  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'3d' | 'top'>('3d');

  const playClick = useSound('/sounds/click3.mp3');
  const playSelect = useSound('/sounds/click4.mp3');

  useEffect(() => {
    hoveredTableRef.current = hoveredTable;
  }, [hoveredTable]);

  useEffect(() => {
    tablesRef.current = tables;
  }, [tables]);

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
      console.error('Erreur chargement tables:', error);
      setTables(getDefaultTables());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultTables = (): RestaurantTable[] => [
    { id: '1', table_number: 1, zone: 'interieur', capacity: 2, position_x: 20, position_y: 20, is_available: true },
    { id: '2', table_number: 2, zone: 'interieur', capacity: 4, position_x: 40, position_y: 20, is_available: true },
    { id: '3', table_number: 3, zone: 'interieur', capacity: 4, position_x: 20, position_y: 40, is_available: false },
    { id: '4', table_number: 4, zone: 'interieur', capacity: 6, position_x: 40, position_y: 40, is_available: true },
    { id: '5', table_number: 5, zone: 'terrasse', capacity: 4, position_x: 65, position_y: 20, is_available: true },
    { id: '6', table_number: 6, zone: 'terrasse', capacity: 4, position_x: 85, position_y: 20, is_available: true },
    { id: '7', table_number: 7, zone: 'terrasse', capacity: 2, position_x: 65, position_y: 40, is_available: false },
    { id: '8', table_number: 8, zone: 'terrasse', capacity: 6, position_x: 85, position_y: 40, is_available: true },
    { id: '9', table_number: 9, zone: 'vip', capacity: 6, position_x: 30, position_y: 75, is_available: true },
    { id: '10', table_number: 10, zone: 'vip', capacity: 8, position_x: 70, position_y: 75, is_available: true },
  ];

  const handleCanvasClick = useCallback((event: MouseEvent) => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);
    const intersects = raycaster.intersectObjects(sceneRef.current.children, true);

    let clickedTableId: string | null = null;
    
    for (const intersect of intersects) {
      let obj: THREE.Object3D | null = intersect.object;
      while (obj) {
        if (obj.userData.tableId) {
          clickedTableId = obj.userData.tableId;
          break;
        }
        obj = obj.parent;
      }
      if (clickedTableId) break;
    }

    if (clickedTableId) {
      const table = tablesRef.current.find(t => t.id === clickedTableId);
      if (table) {
        if (table.is_available) {
          console.log('✅ Table sélectionnée:', table.table_number, table.zone);
          playSelect();
          onSelectTable(table);
        } else {
          console.log('❌ Table occupée:', table.table_number);
        }
      }
    }
  }, [onSelectTable, playSelect]);

  useEffect(() => {
    if (!containerRef.current || loading || tables.length === 0) return;

    if (rendererRef.current && containerRef.current.contains(rendererRef.current.domElement)) {
      containerRef.current.removeChild(rendererRef.current.domElement);
      rendererRef.current.dispose();
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfef7ed);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.set(18, 16, 18);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.minPolarAngle = Math.PI / 6;
    controls.minDistance = 10;
    controls.maxDistance = 35;
    controls.target.set(0, 0, 0);
    controls.enablePan = false;
    controlsRef.current = controls;

    setupLighting(scene);
    createFloor(scene);
    createWalls(scene);
    createBar(scene);
    createTables(scene, tables);
    createDecorations(scene);

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      controls.update();
      
      const time = Date.now() * 0.001;
      tableMeshesRef.current.forEach((group, tableId) => {
        if (tableId === selectedTableId) {
          group.position.y = 0.05 + Math.sin(time * 2) * 0.03;
        } else if (tableId === hoveredTableRef.current) {
          group.position.y = THREE.MathUtils.lerp(group.position.y, 0.03, 0.1);
        } else {
          group.position.y = THREE.MathUtils.lerp(group.position.y, 0, 0.1);
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
      if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(sceneRef.current.children, true);

      let foundTable: string | null = null;
      for (const intersect of intersects) {
        let obj: THREE.Object3D | null = intersect.object;
        while (obj) {
          if (obj.userData.tableId) {
            foundTable = obj.userData.tableId;
            break;
          }
          obj = obj.parent;
        }
        if (foundTable) break;
      }

      if (foundTable !== hoveredTableRef.current) {
        hoveredTableRef.current = foundTable;
        setHoveredTable(foundTable);
        
        if (containerRef.current) {
          const table = tablesRef.current.find(t => t.id === foundTable);
          containerRef.current.style.cursor = foundTable && table?.is_available ? 'pointer' : 'grab';
        }
      }
    };

    containerRef.current.addEventListener('mousemove', handleMouseMove);
    containerRef.current.addEventListener('click', handleCanvasClick);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current);
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
        containerRef.current.removeEventListener('click', handleCanvasClick);
        if (rendererRef.current && containerRef.current.contains(rendererRef.current.domElement)) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
      }
      renderer.dispose();
    };
  }, [tables, loading, handleCanvasClick, selectedTableId]);

  useEffect(() => {
    updateTableColors();
  }, [selectedTableId, hoveredTable, tables]);

  const updateTableColors = () => {
    tableMeshesRef.current.forEach((group, tableId) => {
      const table = tables.find(t => t.id === tableId);
      if (!table) return;

      const tableMesh = group.children.find(c => c.name === 'tableTop') as THREE.Mesh;
      const cloth = group.children.find(c => c.name === 'tableCloth') as THREE.Mesh;
      
      if (tableMesh) {
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
      }

      if (cloth) {
        const clothMat = cloth.material as THREE.MeshStandardMaterial;
        if (tableId === selectedTableId) {
          clothMat.color = new THREE.Color(0x10b981);
        } else if (!table.is_available) {
          clothMat.color = new THREE.Color(0x9ca3af);
        } else {
          switch (table.zone) {
            case 'interieur': clothMat.color = new THREE.Color(0xfef3c7); break;
            case 'terrasse': clothMat.color = new THREE.Color(0xd1fae5); break;
            case 'vip': clothMat.color = new THREE.Color(0xf3e8ff); break;
            default: clothMat.color = new THREE.Color(0xffffff);
          }
        }
      }
    });
  };

  const setupLighting = (scene: THREE.Scene) => {
    scene.add(new THREE.AmbientLight(0xfff5e6, 0.7));

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(15, 25, 15);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.far = 60;
    sunLight.shadow.camera.left = -25;
    sunLight.shadow.camera.right = 25;
    sunLight.shadow.camera.top = 25;
    sunLight.shadow.camera.bottom = -25;
    scene.add(sunLight);

    const warmLight1 = new THREE.PointLight(0xffaa55, 0.8, 20);
    warmLight1.position.set(-6, 5, -6);
    scene.add(warmLight1);

    const warmLight2 = new THREE.PointLight(0xffaa55, 0.8, 20);
    warmLight2.position.set(6, 5, -6);
    scene.add(warmLight2);

    const warmLight3 = new THREE.PointLight(0xffcc77, 0.6, 18);
    warmLight3.position.set(0, 4, 6);
    scene.add(warmLight3);
  };

  const createFloor = (scene: THREE.Scene) => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#d4a574';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 50; i++) {
      ctx.strokeStyle = `rgba(139, 90, 43, ${Math.random() * 0.3})`;
      ctx.lineWidth = Math.random() * 3 + 1;
      ctx.beginPath();
      ctx.moveTo(0, Math.random() * 256);
      ctx.lineTo(256, Math.random() * 256);
      ctx.stroke();
    }
    const floorTexture = new THREE.CanvasTexture(canvas);
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(8, 8);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 24),
      new THREE.MeshStandardMaterial({ map: floorTexture, roughness: 0.7 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const terrasse = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshStandardMaterial({ color: 0x7cb342, roughness: 0.9 })
    );
    terrasse.rotation.x = -Math.PI / 2;
    terrasse.position.set(8, 0.01, -3);
    terrasse.receiveShadow = true;
    scene.add(terrasse);

    const vip = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 6),
      new THREE.MeshStandardMaterial({ color: 0x7c3aed, roughness: 0.8 })
    );
    vip.rotation.x = -Math.PI / 2;
    vip.position.set(0, 0.02, 8);
    vip.receiveShadow = true;
    scene.add(vip);

    const vipBorderMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.3 });
    const vipBorder1 = new THREE.Mesh(new THREE.BoxGeometry(14.2, 0.08, 0.2), vipBorderMat);
    vipBorder1.position.set(0, 0.04, 5);
    scene.add(vipBorder1);
    const vipBorder2 = new THREE.Mesh(new THREE.BoxGeometry(14.2, 0.08, 0.2), vipBorderMat);
    vipBorder2.position.set(0, 0.04, 11);
    scene.add(vipBorder2);
  };

  const createWalls = (scene: THREE.Scene) => {
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf5e6d3, roughness: 0.9 });

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(24, 5, 0.3), wallMat);
    backWall.position.set(0, 2.5, -12);
    backWall.castShadow = true;
    scene.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 5, 24), wallMat);
    leftWall.position.set(-12, 2.5, 0);
    leftWall.castShadow = true;
    scene.add(leftWall);

    const windowMat = new THREE.MeshStandardMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.4 });
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
    [-6, 6].forEach(x => {
      const glass = new THREE.Mesh(new THREE.PlaneGeometry(3, 2.5), windowMat);
      glass.position.set(x, 3, -11.8);
      scene.add(glass);
      const frame = new THREE.Mesh(new THREE.BoxGeometry(3.3, 2.8, 0.15), frameMat);
      frame.position.set(x, 3, -11.85);
      scene.add(frame);
    });

    const signBoard = new THREE.Mesh(
      new THREE.BoxGeometry(8, 1.2, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x2d2d2d })
    );
    signBoard.position.set(0, 4.2, -11.7);
    scene.add(signBoard);

    const neon = new THREE.Mesh(
      new THREE.BoxGeometry(7, 0.6, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 2 })
    );
    neon.position.set(0, 4.2, -11.55);
    scene.add(neon);

    const signLight = new THREE.PointLight(0x10b981, 1.5, 10);
    signLight.position.set(0, 4.2, -10);
    scene.add(signLight);
  };

  const createBar = (scene: THREE.Scene) => {
    const barMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.4 });
    const bar = new THREE.Mesh(new THREE.BoxGeometry(10, 1.2, 1.5), barMat);
    bar.position.set(0, 0.6, -9);
    bar.castShadow = true;
    scene.add(bar);

    const barTop = new THREE.Mesh(
      new THREE.BoxGeometry(10.2, 0.1, 1.7),
      new THREE.MeshStandardMaterial({ color: 0xfaf0e6, roughness: 0.2, metalness: 0.4 })
    );
    barTop.position.set(0, 1.25, -9);
    scene.add(barTop);

    for (let i = -3; i <= 3; i += 2) {
      const stool = new THREE.Group();
      const seat = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.25, 0.1, 16),
        new THREE.MeshStandardMaterial({ color: 0x8b0000 })
      );
      seat.position.y = 0.85;
      stool.add(seat);
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8),
        new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.8 })
      );
      leg.position.y = 0.4;
      stool.add(leg);
      stool.position.set(i, 0, -7.5);
      scene.add(stool);
    }

    for (let y = 2; y <= 4; y += 1) {
      const shelf = new THREE.Mesh(
        new THREE.BoxGeometry(8, 0.1, 0.4),
        new THREE.MeshStandardMaterial({ color: 0x3e2723 })
      );
      shelf.position.set(0, y, -11.5);
      scene.add(shelf);

      for (let x = -3; x <= 3; x += 0.8) {
        const colors = [0x006400, 0x8b4513, 0x4169e1, 0xffd700, 0x800000];
        const bottle = new THREE.Group();
        const bodyMat = new THREE.MeshStandardMaterial({
          color: colors[Math.floor(Math.random() * colors.length)],
          transparent: true,
          opacity: 0.8,
        });
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.4, 8), bodyMat);
        body.position.y = 0.2;
        bottle.add(body);
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.15, 8), bodyMat);
        neck.position.y = 0.45;
        bottle.add(neck);
        bottle.position.set(x + Math.random() * 0.2, y + 0.2, -11.5);
        bottle.scale.setScalar(0.5 + Math.random() * 0.3);
        scene.add(bottle);
      }
    }
  };

  const createTables = (scene: THREE.Scene, tables: RestaurantTable[]) => {
    tableMeshesRef.current.clear();

    tables.forEach(table => {
      const group = new THREE.Group();
      group.userData.tableId = table.id;

      const x = (table.position_x / 100) * 20 - 10;
      const z = (table.position_y / 100) * 20 - 10;

      let baseColor = 0x8b5a2b;
      if (table.zone === 'terrasse') baseColor = 0x6b4423;
      else if (table.zone === 'vip') baseColor = 0x4a2c2a;

      const tableTop = new THREE.Mesh(
        new THREE.CylinderGeometry(0.9, 0.9, 0.08, 32),
        new THREE.MeshStandardMaterial({ color: table.is_available ? baseColor : 0x666666, roughness: 0.3 })
      );
      tableTop.name = 'tableTop';
      tableTop.position.y = 0.8;
      tableTop.castShadow = true;
      tableTop.userData.tableId = table.id;
      group.add(tableTop);

      let clothColor = 0xffffff;
      if (!table.is_available) clothColor = 0x9ca3af;
      else if (table.zone === 'interieur') clothColor = 0xfef3c7;
      else if (table.zone === 'terrasse') clothColor = 0xd1fae5;
      else if (table.zone === 'vip') clothColor = 0xf3e8ff;

      const cloth = new THREE.Mesh(
        new THREE.CylinderGeometry(0.85, 0.95, 0.02, 32),
        new THREE.MeshStandardMaterial({ color: clothColor, roughness: 0.9 })
      );
      cloth.name = 'tableCloth';
      cloth.position.y = 0.85;
      cloth.userData.tableId = table.id;
      group.add(cloth);

      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.12, 0.75, 12),
        new THREE.MeshStandardMaterial({ color: 0x2d2d2d, metalness: 0.7 })
      );
      leg.position.y = 0.4;
      leg.castShadow = true;
      group.add(leg);

      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.35, 0.05, 16),
        new THREE.MeshStandardMaterial({ color: 0x2d2d2d, metalness: 0.7 })
      );
      base.position.y = 0.025;
      group.add(base);

      const chairCount = Math.min(table.capacity, 6);
      for (let i = 0; i < chairCount; i++) {
        const angle = (i / chairCount) * Math.PI * 2 + Math.PI / chairCount;
        const chair = createChair(table.zone, table.is_available);
        chair.position.set(Math.cos(angle) * 1.4, 0, Math.sin(angle) * 1.4);
        chair.rotation.y = -angle + Math.PI;
        group.add(chair);
      }

      const badgeCanvas = document.createElement('canvas');
      badgeCanvas.width = 128;
      badgeCanvas.height = 128;
      const ctx = badgeCanvas.getContext('2d')!;
      ctx.beginPath();
      ctx.arc(64, 64, 56, 0, Math.PI * 2);
      ctx.fillStyle = table.is_available ? '#10b981' : '#6b7280';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 52px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(table.table_number.toString(), 64, 68);

      const badgeTexture = new THREE.CanvasTexture(badgeCanvas);
      const badge = new THREE.Sprite(new THREE.SpriteMaterial({ map: badgeTexture }));
      badge.position.y = 1.6;
      badge.scale.set(0.8, 0.8, 1);
      group.add(badge);

      if (table.is_available) {
        const vase = new THREE.Group();
        const vaseMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.06, 0.04, 0.12, 12),
          new THREE.MeshStandardMaterial({ color: 0xe0e0e0 })
        );
        vaseMesh.position.y = 0.06;
        vase.add(vaseMesh);
        const flowerColors = [0xff6b6b, 0xffd93d, 0x6bcb77, 0x4d96ff];
        const flower = new THREE.Mesh(
          new THREE.SphereGeometry(0.04, 8, 8),
          new THREE.MeshStandardMaterial({ color: flowerColors[Math.floor(Math.random() * flowerColors.length)] })
        );
        flower.position.y = 0.18;
        vase.add(flower);
        vase.position.set(0, 0.85, 0);
        group.add(vase);
      }

      group.position.set(x, 0, z);
      scene.add(group);
      tableMeshesRef.current.set(table.id, group);
    });
  };

  const createChair = (zone: string, isAvailable: boolean): THREE.Group => {
    const chair = new THREE.Group();

    let seatColor = 0x8b0000;
    if (!isAvailable) seatColor = 0x555555;
    else if (zone === 'terrasse') seatColor = 0x228b22;
    else if (zone === 'vip') seatColor = 0x6b21a8;

    const seatMat = new THREE.MeshStandardMaterial({ color: seatColor });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5d4037 });

    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.08, 0.45), seatMat);
    seat.position.y = 0.5;
    seat.castShadow = true;
    chair.add(seat);

    const back = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.5, 0.08), seatMat);
    back.position.set(0, 0.8, -0.2);
    chair.add(back);

    const legGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.5, 8);
    [[-0.18, 0.25, -0.18], [0.18, 0.25, -0.18], [-0.18, 0.25, 0.18], [0.18, 0.25, 0.18]].forEach(pos => {
      const leg = new THREE.Mesh(legGeo, woodMat);
      leg.position.set(pos[0], pos[1], pos[2]);
      chair.add(leg);
    });

    return chair;
  };

  const createDecorations = (scene: THREE.Scene) => {
    [[-11, 0, -11], [11, 0, -11], [-11, 0, 6]].forEach(pos => {
      const plant = new THREE.Group();
      const pot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.3, 0.6, 12),
        new THREE.MeshStandardMaterial({ color: 0xb87333 })
      );
      pot.position.y = 0.3;
      pot.castShadow = true;
      plant.add(pot);

      const foliageMat = new THREE.MeshStandardMaterial({ color: 0x228b22 });
      for (let i = 0; i < 5; i++) {
        const foliage = new THREE.Mesh(new THREE.SphereGeometry(0.3 + Math.random() * 0.2, 8, 8), foliageMat);
        foliage.position.set((Math.random() - 0.5) * 0.4, 0.9 + Math.random() * 0.4, (Math.random() - 0.5) * 0.4);
        plant.add(foliage);
      }
      plant.position.set(pos[0], pos[1], pos[2]);
      scene.add(plant);
    });

    [[-4, 0], [4, 0], [0, 5], [-4, 8], [4, 8]].forEach(pos => {
      const lamp = new THREE.Group();
      const cable = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 1.2, 8),
        new THREE.MeshStandardMaterial({ color: 0x2d2d2d })
      );
      cable.position.y = 0.6;
      lamp.add(cable);

      const shade = new THREE.Mesh(
        new THREE.ConeGeometry(0.35, 0.25, 16, 1, true),
        new THREE.MeshStandardMaterial({ color: 0xffd700, side: THREE.DoubleSide })
      );
      shade.rotation.x = Math.PI;
      lamp.add(shade);

      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xffffee, emissive: 0xffaa55, emissiveIntensity: 1 })
      );
      bulb.position.y = -0.1;
      lamp.add(bulb);

      const light = new THREE.PointLight(0xffaa55, 0.6, 8);
      light.position.y = -0.15;
      lamp.add(light);

      lamp.position.set(pos[0], 4.5, pos[1]);
      scene.add(lamp);
    });

    const vipSign = new THREE.Group();
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8),
      new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8 })
    );
    post.position.y = 0.75;
    vipSign.add(post);
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.5, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x6b21a8, emissive: 0x6b21a8, emissiveIntensity: 0.3 })
    );
    sign.position.y = 1.6;
    vipSign.add(sign);
    vipSign.position.set(-7, 0, 8);
    scene.add(vipSign);
  };

  const resetCamera = () => {
    playClick();
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(18, 16, 18);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
      setViewMode('3d');
    }
  };

  const zoomIn = () => {
    playClick();
    if (cameraRef.current) cameraRef.current.position.multiplyScalar(0.85);
  };

  const zoomOut = () => {
    playClick();
    if (cameraRef.current) cameraRef.current.position.multiplyScalar(1.15);
  };

  const toggleView = () => {
    playClick();
    if (cameraRef.current && controlsRef.current) {
      if (viewMode === '3d') {
        cameraRef.current.position.set(0, 28, 0.1);
        setViewMode('top');
      } else {
        cameraRef.current.position.set(18, 16, 18);
        setViewMode('3d');
      }
      controlsRef.current.target.set(0, 0, 0);
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

  // Fonction pour obtenir l'icône de zone
  const getZoneIcon = (zone: string, size: number = 24) => {
    switch (zone) {
      case 'interieur': return <Home size={size} />;
      case 'terrasse': return <TreePine size={size} />;
      case 'vip': return <Crown size={size} />;
      default: return <Armchair size={size} />;
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-xl p-8 flex justify-center items-center min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="text-gray-700 font-medium text-lg">Chargement du restaurant 3D...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl">
              <Sparkles className="text-white" size={26} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Plan 3D du Restaurant</h2>
              <p className="text-white/80 text-sm">Cliquez sur une table verte pour la réserver</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggleView} className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all" title={viewMode === '3d' ? 'Vue du dessus' : 'Vue 3D'}>
              <Eye size={20} />
            </button>
            <button onClick={zoomIn} className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all" title="Zoom +">
              <ZoomIn size={20} />
            </button>
            <button onClick={zoomOut} className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all" title="Zoom -">
              <ZoomOut size={20} />
            </button>
            <button onClick={resetCamera} className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all" title="Réinitialiser">
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Légende */}
      <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b flex flex-wrap gap-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full shadow"></div>
          <Home size={16} className="text-amber-600" />
          <span className="text-sm text-gray-700 font-medium">Intérieur</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow"></div>
          <TreePine size={16} className="text-green-600" />
          <span className="text-sm text-gray-700 font-medium">Terrasse</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full shadow"></div>
          <Crown size={16} className="text-purple-600" />
          <span className="text-sm text-gray-700 font-medium">VIP</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-400 rounded-full shadow"></div>
          <Ban size={16} className="text-gray-500" />
          <span className="text-sm text-gray-700 font-medium">Occupée</span>
        </div>
      </div>

      {/* Canvas 3D */}
      <div 
        ref={containerRef} 
        className="w-full bg-gradient-to-b from-amber-50 to-orange-50"
        style={{ height: '480px', cursor: 'grab' }}
      />

      {/* Footer */}
      <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t">
        {selectedTableId ? (
          <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-xl p-4 shadow-sm">
            {(() => {
              const selected = tables.find(t => t.id === selectedTableId);
              return selected ? (
                <>
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
                      {getZoneIcon(selected.zone, 28)}
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-800">Table #{selected.table_number}</p>
                      <p className="text-sm text-gray-600">{getZoneLabel(selected.zone)} • {selected.capacity} personnes max</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold text-lg">Sélectionnée</span>
                    <CheckCircle className="text-emerald-500" size={32} />
                  </div>
                </>
              ) : null;
            })()}
          </div>
        ) : hoveredTable ? (
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-4">
            {(() => {
              const hovered = tables.find(t => t.id === hoveredTable);
              return hovered ? (
                <>
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                      {getZoneIcon(hovered.zone, 28)}
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-800">Table #{hovered.table_number}</p>
                      <p className="text-sm text-gray-600">{getZoneLabel(hovered.zone)} • {hovered.capacity} personnes</p>
                    </div>
                  </div>
                  {hovered.is_available ? (
                    <div className="flex items-center gap-2 text-blue-600 font-semibold">
                      <MousePointerClick size={20} />
                      <span>Cliquez pour sélectionner</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-500 font-semibold">
                      <XCircle size={20} />
                      <span>Table occupée</span>
                    </div>
                  )}
                </>
              ) : null;
            })()}
          </div>
        ) : (
          <div className="text-center py-3">
            <p className="text-gray-500 flex items-center justify-center gap-2">
              <Users size={20} />
              <span>Cliquez sur une table disponible (badge vert) pour la sélectionner</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Restaurant3DMap;