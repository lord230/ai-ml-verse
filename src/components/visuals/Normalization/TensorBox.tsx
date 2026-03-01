import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { NormalizationType, NormStats } from './useNormalizationEngine';

interface TensorBoxProps {
    tensor: number[][][]; // [Batch][Channel][Feature]
    batchSize: number;
    channels: number;
    features: number;
    normType: NormalizationType;
    isNormalized: boolean;
    stats: NormStats;
    groupSize: number;
}

export default function TensorBox({
    tensor, batchSize, channels, features, normType, isNormalized, stats, groupSize
}: TensorBoxProps) {
    const groupRef = useRef<Group>(null);

    // Subtle gentle float animation
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
        }
    });

    // Determines color based on value: Blue (negative) -> White (near 0) -> Red (positive)
    const getColor = (val: number) => {
        // Clamp for extreme noise
        const clamped = Math.max(-3, Math.min(3, val));

        if (clamped < 0) {
            // Negative: Shift from White to Blue
            const intensity = Math.abs(clamped) / 3;
            // r,g decrease, b stays high
            const r = Math.round(255 * (1 - intensity));
            const g = Math.round(255 * (1 - intensity * 0.5));
            return `rgb(${r},${g},255)`;
        } else {
            // Positive: Shift from White to Red
            const intensity = clamped / 3;
            // g,b decrease, r stays high
            const g = Math.round(255 * (1 - intensity));
            const b = Math.round(255 * (1 - intensity));
            return `rgb(255,${g},${b})`;
        }
    };

    // We center the entire block around (0,0,0) geometry
    const offsetX = features / 2;
    const offsetY = channels / 2;
    const offsetZ = batchSize / 2;

    const spacing = 1.1; // Space between cubes

    return (
        <group ref={groupRef}>
            {/* Render the 3D data cubes */}
            {tensor.map((batchPlane, b) =>
                batchPlane.map((channelRow, c) =>
                    channelRow.map((val, f) => {
                        const x = (f - offsetX + 0.5) * spacing;
                        const y = (c - offsetY + 0.5) * spacing;
                        const z = (b - offsetZ + 0.5) * spacing;

                        // We scale the cube down slightly to look like distinct units
                        const size = 0.85;

                        // To build intuition, we strongly highlight the specific slice that is being 
                        // averaged over together at any given moment.
                        // We will arbitrarily pick: Batch 0, Channel 0, Group 0 to be the "demo" slice.

                        let isHighlighted = true;
                        if (!isNormalized) {
                            if (normType === 'layer') {
                                // LayerNorm normalizes across (C, F) per Sample. So only B=0 is highlighted.
                                isHighlighted = (b === 0);
                            } else if (normType === 'batch') {
                                // BatchNorm normalizes across (B, F) per Channel. So only C=0 is highlighted.
                                isHighlighted = (c === 0);
                            } else if (normType === 'instance') {
                                // InstanceNorm normalizes across (F) per Sample per Channel. So B=0, C=0 is highlighted.
                                isHighlighted = (b === 0 && c === 0);
                            } else if (normType === 'group') {
                                // GroupNorm normalizes across (F, Group) per Sample.
                                const actualGroupSize = Math.max(1, Math.min(channels, groupSize));
                                // Highlight the first group of the first sample
                                isHighlighted = (b === 0 && c < actualGroupSize);
                            }
                        }

                        // When normalized, we show everything to prove the whole tensor is done.
                        // But while raw, we show the focus slice.
                        const opacity = isHighlighted ? 0.95 : 0.15;
                        const emissiveIntensity = isHighlighted && !isNormalized ? 0.4 : 0;

                        return (
                            <mesh key={`${b}-${c}-${f}`} position={[x, y, z]}>
                                <boxGeometry args={[size, size, size]} />
                                <meshStandardMaterial
                                    color={getColor(val)}
                                    emissive={getColor(val)}
                                    emissiveIntensity={emissiveIntensity}
                                    roughness={0.2}
                                    metalness={0.1}
                                    transparent={true}
                                    opacity={opacity}
                                />
                            </mesh>
                        );
                    })
                )
            )}

            {/* Bounding Box Wireframe for context */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[features * spacing, channels * spacing, batchSize * spacing]} />
                <meshBasicMaterial color="#334155" wireframe={true} transparent opacity={0.3} />
            </mesh>
        </group>
    );
}
