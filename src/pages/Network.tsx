// NetworkOptimizer.js
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, BarChart, Bar, ReferenceLine, Treemap } from 'recharts';
import { Activity, Wifi, AlertTriangle, Download, FileDown, Settings, Radio, Network, Globe, AlertCircle, RefreshCw, Zap, Cpu, Server, MonitorSmartphone, HelpCircle, Save, FileText, BarChart2, Map, Shield, Calendar, Coffee, Eye, X, ChevronRight, Router, Signal, Lock, Database, Upload, TrendingUp, Check, Sliders, Wifi as WifiIcon, FileDigit, Hammer, FlaskConical, Layers, Repeat, Focus, Sparkles, Waves, Plus, Minus, Maximize2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { motion } from 'framer-motion';

// Type definitions for better TypeScript support
interface NetworkMetrics {
  health: 'optimal' | 'good' | 'warning' | 'critical';
  download: number;
  upload: number;
  latency: number;
  packetLoss: number;
  jitter: number;
  connectedDevices: number;
  bandwidth: number;
  signalStrength: number;
  networkType: string;
  channelUtilization: number;
  interferenceLevel: number;
  uptime: number;
  channelWidth?: string;
  frequency?: string;
  snr?: number;
  dataUsage: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  security: {
    score: number;
    threats: number;
    vulnerabilities: {
      high: number;
      medium: number;
      low: number;
    };
    lastScan: string;
    activeFeatures?: string[];
  };
  optimization: {
    status: 'optimal' | 'needs_improvement';
    suggestions: Array<{
      type: string;
      description: string;
      impact: 'high' | 'medium' | 'low';
    }>;
  };
  qos: {
    enabled: boolean;
    rules: number;
  };
  anomalies: Array<{
    type: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
    timestamp: string;
  }>;
}

interface NetworkDevice {
  id: string;
  name: string;
  ip: string;
  mac: string;
  type: string;
  bandwidth: number;
  signalStrength: number;
  connected: string;
  activity: number;
  protocol: string;
  dataUsage: {
    download: number;
    upload: number;
  };
  securityStatus: string;
  lastActivity: string;
}

interface SpeedTestResult {
  download: number;
  upload: number;
  latency: number;
  jitter: number;
  server: string;
  location: string;
  timestamp: string;
  isp: string;
  testId: string;
}

interface NetworkTopology {
  nodes: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    position: {
      x: number;
      y: number;
    };
  }>;
  connections: Array<{
    source: string;
    target: string;
    status: string;
    bandwidth: number;
    type: string;
  }>;
}

interface ChannelAnalysis {
  analysis2G: Array<{
    channel: number;
    utilization: number;
    interference: number;
    quality: number;
    recommended: boolean;
  }>;
  analysis5G: Array<{
    channel: number;
    utilization: number;
    interference: number;
    quality: number;
    recommended: boolean;
  }>;
  currentSettings: {
    channel2G: number;
    channel5G: number;
    width2G: string;
    width5G: string;
    txPower2G: string;
    txPower5G: string;
  };
  recommendations: {
    channel2G: number;
    channel5G: number;
    width2G: string;
    width5G: string;
    txPower2G: string;
    txPower5G: string;
    reason: string;
  };
}

interface QoSSettings {
  enabled: boolean;
  devicePriorities: Array<{
    deviceId: string;
    name: string;
    type: string;
    priority: string;
    bandwidth: {
      guaranteed: number;
      maximum: number;
    };
  }>;
  servicePriorities: Array<{
    name: string;
    priority: string;
    iconName: string;
    enabled: boolean;
  }>;
  bandwidthRules: {
    totalBandwidth: {
      download: number;
      upload: number;
    };
    reservedBandwidth: {
      download: number;
      upload: number;
    };
    priorityAllocation: Array<{
      priority: string;
      downloadPercent: number;
      uploadPercent: number;
    }>;
  };
  loading?: boolean;
}

interface FirewallRules {
  enabled: boolean;
  rules: Array<{
    id: string;
    name: string;
    type: string;
    protocol: string;
    sourceIP: string;
    destinationIP: string;
    sourcePort: string | number;
    destinationPort: string | number;
    enabled: boolean;
    description: string;
  }>;
  defaultPolicy: string;
  securityLevel: string;
  lastUpdated: string;
}

interface DiagnosticParams {
  host?: string;
  port?: number;
  protocol?: string;
}

interface DiagnosticResult {
  success: boolean;
  command: string;
  error?: string;
  results?: any;
  result?: any;
  statistics?: any;
}

interface OptimizationResult {
  success: boolean;
  message?: string;
  error?: string;
  results?: {
    beforeScore: number;
    afterScore: number;
    improvement: string;
    details: string;
  };
}

interface NetworkReport {
  timestamp: string;
  metrics: NetworkMetrics;
  devices: NetworkDevice[];
  summary: {
    healthScore: number;
    improvements: string[];
    trends: {
      daily: number;
      weekly: number;
      monthly: number;
    };
  };
  recommendations: {
    security: string[];
    performance: string[];
    maintenance: string[];
  };
}

// Constants and Configuration
const CONFIG = {
  REFRESH_INTERVAL: 2000,
  CHART_POINTS: 50,
  NOTIFICATION_DURATION: 5000,
  REPORT_INTERVAL: 3600000,
  THRESHOLDS: {
    SPEED: {
      DOWNLOAD: { GOOD: 50, WARNING: 30, CRITICAL: 10 },
      UPLOAD: { GOOD: 25, WARNING: 15, CRITICAL: 5 }
    },
    LATENCY: { GOOD: 50, WARNING: 100, CRITICAL: 200 },
    PACKET_LOSS: { GOOD: 0.5, WARNING: 1, CRITICAL: 5 },
    SIGNAL: { GOOD: 70, WARNING: 50, CRITICAL: 30 },
    INTERFERENCE: { LOW: 1, MEDIUM: 2, HIGH: 4 },
    SECURITY: { GOOD: 8, WARNING: 6, CRITICAL: 4 }
  },
  SECURITY_FEATURES: [
    'WPA3 Enterprise',
    'Advanced Firewall',
    'MAC Filtering',
    'Guest Network',
    'VPN Support',
    'Intrusion Detection',
    'DNS Protection',
    'Port Scanning'
  ],
  QOS_PRIORITIES: [
    { name: 'Video Conferencing', priority: 'highest', iconName: 'Camera' },
    { name: 'Voice Calls', priority: 'high', iconName: 'Phone' },
    { name: 'Gaming', priority: 'medium', iconName: 'GameController' },
    { name: 'Streaming', priority: 'medium', iconName: 'Video' },
    { name: 'Web Browsing', priority: 'normal', iconName: 'Globe' },
    { name: 'File Downloads', priority: 'low', iconName: 'Download' },
    { name: 'Background Services', priority: 'lowest', iconName: 'Activity' }
  ],
  OPTIMIZATION_TECHNIQUES: [
    { id: 'channel_opt', name: 'Channel Optimization', description: 'Automatically selects the best channel with least interference' },
    { id: 'band_steering', name: 'Band Steering', description: 'Direct capable devices to 5GHz band for better performance' },
    { id: 'beam_forming', name: 'Beamforming', description: 'Focus signal toward connected devices for better coverage' },
    { id: 'qos', name: 'QoS Prioritization', description: 'Prioritize important traffic for smooth experience' },
    { id: 'smart_connect', name: 'Smart Connect', description: 'Automatically connect devices to optimal band' },
    { id: 'airtime_fairness', name: 'Airtime Fairness', description: 'Ensure no single device monopolizes bandwidth' }
  ],
  DIAGNOSTIC_TOOLS: [
    { id: 'ping', name: 'Ping Test', description: 'Check connectivity to remote servers' },
    { id: 'traceroute', name: 'Traceroute', description: 'Show path to destination and identify bottlenecks' },
    { id: 'dns_lookup', name: 'DNS Lookup', description: 'Verify DNS resolution is functioning properly' },
    { id: 'bandwidth_test', name: 'Bandwidth Test', description: 'Measure your connection speed' },
    { id: 'port_scan', name: 'Port Scan', description: 'Check for open ports that might be security risks' }
  ],
  COLORS: {
    primary: '#570DF8',
    secondary: '#F000B8',
    accent: '#37CDBE',
    neutral: '#3D4451',
    success: '#36D399',
    warning: '#FBBD23',
    error: '#F87272',
    info: '#3ABFF8'
  }
};

// Network Service Implementation
const NetworkService = {
  generateMockData(): NetworkMetrics {
    const date = new Date();
    const timestamp = date.toISOString();
    
    const healthStatuses: Array<NetworkMetrics['health']> = ['optimal', 'good', 'warning', 'critical'];
    const healthIndex = Math.floor(Math.random() * healthStatuses.length);
    
    return {
      health: healthStatuses[healthIndex],
      download: Math.floor(Math.random() * 400) + 100,
      upload: Math.floor(Math.random() * 100) + 20,
      latency: Math.floor(Math.random() * 100) + 5,
      packetLoss: parseFloat((Math.random() * 5).toFixed(2)),
      jitter: parseFloat((Math.random() * 10).toFixed(2)),
      connectedDevices: Math.floor(Math.random() * 10) + 1,
      bandwidth: Math.floor(Math.random() * 500) + 100,
      signalStrength: Math.floor(Math.random() * 30) + 70,
      networkType: Math.random() > 0.5 ? '5GHz' : '2.4GHz',
      channelUtilization: parseFloat((Math.random() * 100).toFixed(2)),
      interferenceLevel: parseFloat((Math.random() * 100).toFixed(2)),
      uptime: Math.floor(Math.random() * 30) + 1,
      channelWidth: Math.random() > 0.5 ? '40MHz' : '20MHz',
      frequency: Math.random() > 0.5 ? '5GHz' : '2.4GHz',
      snr: Math.floor(Math.random() * 30) + 15,
      dataUsage: {
        daily: parseFloat((Math.random() * 10).toFixed(2)),
        weekly: parseFloat((Math.random() * 50).toFixed(2)),
        monthly: parseFloat((Math.random() * 200).toFixed(2))
      },
      security: {
        score: Math.floor(Math.random() * 40) + 60,
        threats: Math.floor(Math.random() * 5),
        vulnerabilities: {
          high: Math.floor(Math.random() * 3),
          medium: Math.floor(Math.random() * 5),
          low: Math.floor(Math.random() * 10)
        },
        lastScan: timestamp,
        activeFeatures: ['WPA3', 'Firewall', 'DNS Protection'].filter(() => Math.random() > 0.3)
      },
      optimization: {
        status: Math.random() > 0.5 ? 'optimal' : 'needs_improvement',
        suggestions: Array.from({ length: Math.floor(Math.random() * 5) }, () => ({
          type: ['Channel', 'Position', 'Firmware', 'Bandwidth'][Math.floor(Math.random() * 4)],
          description: ['Update firmware', 'Change WiFi channel', 'Relocate router', 'Upgrade bandwidth'][Math.floor(Math.random() * 4)],
          impact: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as 'high' | 'medium' | 'low'
        }))
      },
      qos: {
        enabled: Math.random() > 0.3,
        rules: Math.floor(Math.random() * 5)
      },
      anomalies: Array.from({ length: Math.floor(Math.random() * 3) }, () => ({
        type: ['Interference', 'Congestion', 'Connection Drop', 'Security Threat'][Math.floor(Math.random() * 4)],
        description: ['High channel interference detected', 'Network congestion on channel 6', 'Connection drops on living room devices', 'Suspicious connection attempt blocked'][Math.floor(Math.random() * 4)],
        severity: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as 'high' | 'medium' | 'low',
        timestamp
      }))
    };
  },

  // Safely access signal strength with null checks
  // Safe rendering of signal strength
  _renderSignalStrength(metrics: NetworkMetrics | null) {
    if (!metrics) return null;
    
    return (
      <div className="flex items-center">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${
              metrics.signalStrength >= 80 ? 'bg-green-500' : 
              metrics.signalStrength >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${metrics.signalStrength}%` }}
          ></div>
        </div>
        <span className="ml-2 text-sm font-medium">{metrics.signalStrength}%</span>
      </div>
    );
  },

  // Safe date formatting
  _formatDate(dateString: string | undefined) {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleString();
  },

  // Safe vulnerability display
  _renderVulnerabilities(metrics: NetworkMetrics | null) {
    if (!metrics || !metrics.security || !metrics.security.vulnerabilities) return null;
    
    const { vulnerabilities } = metrics.security;
    return (
      <div className="flex space-x-2">
        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
          High: {vulnerabilities.high}
        </span>
        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
          Medium: {vulnerabilities.medium}
        </span>
        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
          Low: {vulnerabilities.low}
        </span>
      </div>
    );
  },
  
  // Safe CSS variable creation
  _getProgressStyle(value: number) {
    return {
      '--value': `${value}%`
    } as React.CSSProperties;
  },

  // Error handling wrapper
  async _handleApiCall<T>(apiCall: () => Promise<T>): Promise<T> {
    try {
      return await apiCall();
    } catch (error) {
      console.error("API Error:", error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  },

  async runDiagnosticTool(tool: string, params: DiagnosticParams): Promise<DiagnosticResult> {
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate mock diagnostic results
    let success = Math.random() > 0.2;
    let error = success ? undefined : 'Connection timed out';
    let results;
    
    switch (tool) {
      case 'ping':
        const pingHost = params.host || '8.8.8.8';
        results = {
          command: `ping ${pingHost}`,
          host: pingHost,
          packets: 4,
          sent: 4,
          received: success ? 4 : Math.floor(Math.random() * 3),
          packetLoss: success ? 0 : Math.floor(Math.random() * 100),
          times: {
            min: success ? Math.floor(Math.random() * 10) + 5 : 0,
            avg: success ? Math.floor(Math.random() * 15) + 10 : 0,
            max: success ? Math.floor(Math.random() * 20) + 20 : 0
          },
          roundtrip: Array.from({ length: 4 }, () => ({
            sequence: Math.floor(Math.random() * 1000),
            time: Math.floor(Math.random() * 100),
            ttl: 64
          }))
        };
        break;
        
      case 'traceroute':
        const traceHost = params.host || 'google.com';
        results = {
          command: `traceroute ${traceHost}`,
          host: traceHost,
          hops: Array.from({ length: success ? Math.floor(Math.random() * 10) + 5 : 0 }, (_, i) => ({
            hop: i + 1,
            host: `hop-${i + 1}.example.com`,
            ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            rtt: [
              Math.floor(Math.random() * 100),
              Math.floor(Math.random() * 100),
              Math.floor(Math.random() * 100)
            ]
          }))
        };
        break;
        
      case 'dns_lookup':
        const dnsHost = params.host || 'example.com';
        results = {
          command: `nslookup ${dnsHost}`,
          host: dnsHost,
          records: success ? [
            {
              type: 'A',
              address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
              ttl: Math.floor(Math.random() * 86400)
            },
            {
              type: 'AAAA',
              address: `2001:0db8:85a3:0000:0000:8a2e:0370:${Math.floor(Math.random() * 9999)}`,
              ttl: Math.floor(Math.random() * 86400)
            },
            {
              type: 'MX',
              address: `mail.${dnsHost}`,
              priority: Math.floor(Math.random() * 100),
              ttl: Math.floor(Math.random() * 86400)
            }
          ] : []
        };
        break;
        
      case 'port_scan':
        const portHost = params.host || '192.168.1.1';
        const port = params.port || 80;
        results = {
          command: `nmap -p ${port} ${portHost}`,
          host: portHost,
          ports: success ? [
            {
              port: port,
              state: Math.random() > 0.3 ? 'open' : 'closed',
              service: ['http', 'ssh', 'ftp', 'smtp', 'dns'][Math.floor(Math.random() * 5)]
            }
          ] : []
        };
        break;
        
      case 'bandwidth_test':
        results = {
          command: 'speedtest',
          download: success ? Math.floor(Math.random() * 500) + 50 : 0,
          upload: success ? Math.floor(Math.random() * 100) + 10 : 0,
          latency: success ? Math.floor(Math.random() * 50) + 5 : 0,
          server: 'speedtest.net',
          location: 'New York, USA',
          isp: 'Example ISP'
        };
        break;
        
      default:
        return {
          success: false,
          command: `unknown command: ${tool}`,
          error: 'Unknown diagnostic tool'
        };
    }
    
    return {
      success,
      command: results.command,
      error,
      result: success ? results : undefined
    };
  },

  // Add missing methods to NetworkService
  async getMetrics(): Promise<NetworkMetrics> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return this.generateMockData();
  },

  async getDevices(): Promise<NetworkDevice[]> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate mock device data
    return Array.from({ length: 5 + Math.floor(Math.random() * 8) }, (_, i) => {
      const deviceTypes = ['smartphone', 'laptop', 'tablet', 'smarthome', 'tv', 'desktop', 'game console'];
      const type = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
      const activity = Math.random() * 100;
      const connected = new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)).toISOString();
      
      return {
      id: `device-${i}`,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${i + 1}`,
        ip: `192.168.1.${10 + i}`,
        mac: `00:1A:2B:${Math.floor(Math.random() * 100).toString(16).padStart(2, '0')}:${Math.floor(Math.random() * 100).toString(16).padStart(2, '0')}:${Math.floor(Math.random() * 100).toString(16).padStart(2, '0')}`,
        type,
        bandwidth: Math.floor(Math.random() * 200),
        signalStrength: Math.floor(Math.random() * 40) + 60,
        connected,
        activity,
        protocol: Math.random() > 0.3 ? '802.11ac' : '802.11n',
      dataUsage: {
          download: parseFloat((Math.random() * 2).toFixed(2)),
          upload: parseFloat((Math.random() * 0.5).toFixed(2))
        },
        securityStatus: Math.random() > 0.9 ? 'vulnerable' : 'secure',
        lastActivity: new Date(Date.now() - Math.floor(Math.random() * 60 * 60 * 1000)).toISOString()
      };
    });
  },

  async getNetworkTopology(): Promise<NetworkTopology> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a mock network topology
    const deviceCount = Math.floor(Math.random() * 5) + 5;
    const connections: NetworkTopology['connections'] = [];
    const nodes: NetworkTopology['nodes'] = [
      {
        id: 'router',
        name: 'Main Router',
        type: 'router',
        status: 'active',
        position: { x: 50, y: 15 }
      },
      {
        id: 'modem',
        name: 'Modem',
        type: 'modem',
        status: 'active',
        position: { x: 50, y: 5 }
      }
    ];

    // Add connection between modem and router
    connections.push({
      source: 'modem',
      target: 'router',
      status: 'active',
      bandwidth: 1000,
      type: 'wired'
    });

    // Potentially add mesh nodes
    const hasMesh = Math.random() > 0.5;
    let meshNodeCount = 0;
    if (hasMesh) {
      meshNodeCount = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < meshNodeCount; i++) {
        const id = `mesh-${i}`;
        nodes.push({
          id,
          name: `Mesh Node ${i + 1}`,
          type: 'mesh',
          status: 'active',
          position: { 
            x: 30 + (i * 40), 
            y: 30
          }
        });
        
        connections.push({
          source: 'router',
          target: id,
          status: 'active',
          bandwidth: 866,
          type: i === 0 ? 'wired' : 'wireless'
        });
      }
    }

    // Generate end devices and connect them
    for (let i = 0; i < deviceCount; i++) {
      const deviceTypes = ['smartphone', 'laptop', 'smarthome', 'tablet', 'tv'];
      const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
      const id = `device-${i}`;
      const connectionType = Math.random() > 0.3 ? 'wireless' : 'wired';
      const connectTo = hasMesh && Math.random() > 0.5 
        ? `mesh-${Math.floor(Math.random() * meshNodeCount)}`
        : 'router';
      
      // Position devices in a circle around their connection point
      const angle = (2 * Math.PI * i) / deviceCount;
      const connectionNode = nodes.find(n => n.id === connectTo);
      const radius = 20;
      
      // Safe check to handle potentially undefined connectionNode
      if (!connectionNode) continue;
      
      const x = connectionNode.position.x + radius * Math.cos(angle);
      const y = connectionNode.position.y + 20 + radius * Math.sin(angle);
      
      nodes.push({
        id,
        name: `${deviceType.charAt(0).toUpperCase() + deviceType.slice(1)} ${i + 1}`,
        type: deviceType,
        status: Math.random() > 0.9 ? 'issue' : 'active',
        position: { x, y }
      });
      
      connections.push({
        source: connectTo,
        target: id,
        status: Math.random() > 0.9 ? 'weak' : 'active',
        bandwidth: connectionType === 'wired' ? 1000 : (Math.random() > 0.5 ? 866 : 300),
        type: connectionType
      });
    }

    return { nodes, connections };
  },

  async getChannelAnalysis(): Promise<ChannelAnalysis> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const generate2GChannels = () => {
      return Array.from({ length: 11 }, (_, i) => {
        const channel = i + 1;
        const utilization = Math.floor(Math.random() * 100);
        const interference = Math.floor(Math.random() * 100);
        const quality = 100 - (utilization * 0.5) - (interference * 0.5);
        
    return {
          channel,
          utilization,
          interference,
          quality,
          recommended: false
        };
      }).sort((a, b) => b.quality - a.quality);
    };
    
    const generate5GChannels = () => {
      const channels = [36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140, 144, 149, 153, 157, 161, 165];
      return channels.map(channel => {
        const utilization = Math.floor(Math.random() * 100);
        const interference = Math.floor(Math.random() * 100);
        const quality = 100 - (utilization * 0.5) - (interference * 0.5);
        
        return {
          channel,
          utilization,
          interference,
          quality,
          recommended: false
        };
      }).sort((a, b) => b.quality - a.quality).slice(0, 12);
    };
    
    const analysis2G = generate2GChannels();
    const analysis5G = generate5GChannels();
    
    // Mark recommended channels
    analysis2G[0].recommended = true;
    analysis5G[0].recommended = true;
    
    const currentSettings = {
      channel2G: analysis2G.find(c => Math.random() > 0.7)?.channel || analysis2G[Math.floor(Math.random() * analysis2G.length)].channel,
      channel5G: analysis5G.find(c => Math.random() > 0.7)?.channel || analysis5G[Math.floor(Math.random() * analysis5G.length)].channel,
      width2G: ['20MHz', '40MHz'][Math.floor(Math.random() * 2)],
      width5G: ['40MHz', '80MHz', '160MHz'][Math.floor(Math.random() * 3)],
      txPower2G: ['Low', 'Medium', 'High', 'Auto'][Math.floor(Math.random() * 4)],
      txPower5G: ['Low', 'Medium', 'High', 'Auto'][Math.floor(Math.random() * 4)]
    };
    
    return {
      analysis2G,
      analysis5G,
      currentSettings,
      recommendations: {
        channel2G: analysis2G[0].channel,
        channel5G: analysis5G[0].channel,
        width2G: '40MHz',
        width5G: '80MHz',
        txPower2G: 'Auto',
        txPower5G: 'Auto',
        reason: 'These settings provide the best performance based on current environment analysis.'
      }
    };
  },

  async getQoSSettings(): Promise<QoSSettings> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const devices = await this.getDevices();
    
    const devicePriorities = devices.map(device => ({
      deviceId: device.id,
      name: device.name,
      type: device.type,
      priority: ['highest', 'high', 'medium', 'normal', 'low'][Math.floor(Math.random() * 5)],
      bandwidth: {
        guaranteed: Math.floor(Math.random() * 10) + 5,
        maximum: Math.floor(Math.random() * 50) + 20
      }
    }));
    
    const servicePriorities = CONFIG.QOS_PRIORITIES.map(service => ({
      ...service,
      enabled: Math.random() > 0.3
    }));
    
    return {
      enabled: Math.random() > 0.3,
      devicePriorities,
      servicePriorities,
      bandwidthRules: {
        totalBandwidth: {
          download: Math.floor(Math.random() * 400) + 100,
          upload: Math.floor(Math.random() * 100) + 20
        },
        reservedBandwidth: {
          download: Math.floor(Math.random() * 100) + 50,
          upload: Math.floor(Math.random() * 30) + 10
        },
        priorityAllocation: [
          { priority: 'highest', downloadPercent: 40, uploadPercent: 40 },
          { priority: 'high', downloadPercent: 30, uploadPercent: 30 },
          { priority: 'medium', downloadPercent: 20, uploadPercent: 20 },
          { priority: 'normal', downloadPercent: 10, uploadPercent: 10 },
          { priority: 'low', downloadPercent: 0, uploadPercent: 0 }
        ]
      }
    };
  },

  async generateReport(): Promise<NetworkReport> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const metrics = await this.getMetrics();
    const devices = await this.getDevices();
    
    return {
      timestamp: new Date().toISOString(),
      metrics,
      devices,
      summary: {
        healthScore: metrics.security.score,
        improvements: [
          'Optimize WiFi Channel',
          'Update firmware on router',
          'Enable QoS for video streaming'
        ],
        trends: {
          daily: Math.random() * 5 - 2.5,
          weekly: Math.random() * 10 - 5,
          monthly: Math.random() * 15 - 7.5
        }
      },
      recommendations: {
        security: [
          'Enable MAC filtering',
          'Update router firmware',
          'Change default credentials'
        ],
        performance: [
          'Switch to 5GHz network',
          'Optimize channel settings',
          'Move router to central location'
        ],
        maintenance: [
          'Schedule weekly reboots',
          'Remove unused devices',
          'Check for firmware updates monthly'
        ]
      }
    };
  },

  async runSpeedTest(): Promise<SpeedTestResult> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      download: Math.floor(Math.random() * 500) + 50,
      upload: Math.floor(Math.random() * 100) + 20,
      latency: Math.floor(Math.random() * 50) + 5,
      jitter: Math.floor(Math.random() * 10),
      server: 'speedtest.net',
      location: 'New York, USA',
      timestamp: new Date().toISOString(),
      isp: 'Example ISP',
      testId: Math.random().toString(36).substring(2, 15)
    };
  },

  // Add applyOptimizationTechnique method to NetworkService
  async applyOptimizationTechnique(techniqueId: string): Promise<OptimizationResult> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const success = Math.random() > 0.2;
    
    if (!success) {
      return {
        success: false,
        error: 'Failed to apply optimization technique',
        message: 'The operation timed out or encountered an error'
      };
    }
    
    const technique = CONFIG.OPTIMIZATION_TECHNIQUES.find(t => t.id === techniqueId);
    
    return {
      success: true,
      message: `Successfully applied ${technique?.name || 'optimization technique'}`,
      results: {
        beforeScore: Math.floor(Math.random() * 30) + 60,
        afterScore: Math.floor(Math.random() * 20) + 80,
        improvement: `${Math.floor(Math.random() * 20) + 5}%`,
        details: `Applied ${technique?.description || 'optimization'} resulting in improved network performance.`
      }
    };
  },

  // Add updateQoSSettings method to NetworkService
  async updateQoSSettings(settings: QoSSettings): Promise<QoSSettings> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return settings;
  },

  // Add getFirewallRules method to NetworkService
  async getFirewallRules(): Promise<FirewallRules> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      enabled: Math.random() > 0.3,
      rules: Array.from({ length: Math.floor(Math.random() * 5) + 3 }, (_, i) => ({
        id: `rule-${i}`,
        name: `Rule ${i + 1}`,
        type: ['Block', 'Allow'][Math.floor(Math.random() * 2)],
        protocol: ['TCP', 'UDP', 'ICMP', 'Any'][Math.floor(Math.random() * 4)],
        sourceIP: Math.random() > 0.5 ? '192.168.1.0/24' : 'Any',
        destinationIP: Math.random() > 0.7 ? '0.0.0.0/0' : `203.0.113.${Math.floor(Math.random() * 255)}`,
        sourcePort: Math.random() > 0.5 ? 'Any' : Math.floor(Math.random() * 65535),
        destinationPort: Math.random() > 0.5 ? 'Any' : [80, 443, 22, 53, 3389][Math.floor(Math.random() * 5)],
        enabled: Math.random() > 0.2,
        description: ['Block outgoing traffic', 'Allow incoming connections', 'Permit LAN access', 'Block suspicious IPs'][Math.floor(Math.random() * 4)]
      })),
      defaultPolicy: Math.random() > 0.5 ? 'Allow' : 'Block',
      securityLevel: ['Low', 'Medium', 'High', 'Custom'][Math.floor(Math.random() * 4)],
      lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)).toISOString()
    };
  }
};

// Custom Hooks
const useNetworkMetrics = () => {
  const [metrics, setMetrics] = useState<NetworkMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchMetrics = async () => {
      try {
        const data = await NetworkService.getMetrics();
        if (mounted) {
          setMetrics(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, CONFIG.REFRESH_INTERVAL);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return { metrics, loading, error };
};

// Main Component
const NetworkOptimizer = () => {
  // State management
  const { metrics, loading: metricsLoading, error: metricsError } = useNetworkMetrics();
  const [historicalData, setHistoricalData] = useState<NetworkMetrics[]>([]);
  const [testInProgress, setTestInProgress] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState<{ id: number; message: string; type: string }[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState<NetworkReport | null>(null);
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<NetworkDevice | null>(null);
  const [networkMap, setNetworkMap] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [automationRules, setAutomationRules] = useState([]);
  
  // New state for enhanced features
  const [topologyData, setTopologyData] = useState<NetworkTopology | null>(null);
  const [topologyLoading, setTopologyLoading] = useState(false);
  const [channelAnalysis, setChannelAnalysis] = useState<ChannelAnalysis | null>(null);
  const [qosSettings, setQosSettings] = useState<QoSSettings | null>(null);
  const [firewallRules, setFirewallRules] = useState<FirewallRules | null>(null);
  const [diagnosticResults, setDiagnosticResults] = useState<{
    toolId: string;
    toolName: string;
    result: DiagnosticResult;
  } | null>(null);
  const [diagnosticInProgress, setDiagnosticInProgress] = useState(false);
  const [optimizationInProgress, setOptimizationInProgress] = useState(false);
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResult | null>(null);
  const [displayMode, setDisplayMode] = useState('visual'); // visual or technical

  // Add these to the top level of the NetworkOptimizer component right after the existing useState declarations
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragNode, setDragNode] = useState<string | null>(null);
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [animatedNodes, setAnimatedNodes] = useState<{[key: string]: boolean}>({});

  // Update historical data
  useEffect(() => {
    if (metrics) {
      setHistoricalData(prev => [...prev, {
        ...metrics,
        timestamp: new Date().getTime()
      }].slice(-CONFIG.CHART_POINTS));
    }
  }, [metrics]);

  // Fetch devices
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const deviceData = await NetworkService.getDevices();
        setDevices(deviceData);
      } catch (error) {
        addNotification(error instanceof Error ? error.message : 'Failed to fetch devices', 'error');
      }
    };

    fetchDevices();
    const interval = setInterval(fetchDevices, CONFIG.REFRESH_INTERVAL * 2);
    return () => clearInterval(interval);
  }, []);

  // Fetch network topology data on initial load
  useEffect(() => {
    const fetchTopologyData = async () => {
      if (activeTab === 'topology' && !topologyData) {
        setTopologyLoading(true);
        try {
          const data = await NetworkService.getNetworkTopology();
          setTopologyData(data);
        } catch (error) {
          addNotification(`Failed to load topology data: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        } finally {
          setTopologyLoading(false);
        }
      }
    };

    fetchTopologyData();
  }, [activeTab, topologyData]);

  // Fetch channel analysis data on initial load
  useEffect(() => {
    if (activeTab === 'optimization' && !channelAnalysis) {
      NetworkService.getChannelAnalysis()
        .then(data => {
          setChannelAnalysis(data);
        })
        .catch(error => {
          addNotification('Failed to load channel analysis', 'error');
        });
    }
  }, [activeTab, channelAnalysis]);

  // Fetch QoS settings on initial load
  useEffect(() => {
    if (activeTab === 'qos' && !qosSettings) {
      NetworkService.getQoSSettings()
        .then(data => {
          setQosSettings(data);
        })
        .catch(error => {
          addNotification('Failed to load QoS settings', 'error');
        });
    }
  }, [activeTab, qosSettings]);

  // Notification handler
  const addNotification = useCallback((message: string, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, CONFIG.NOTIFICATION_DURATION);
  }, []);

  // Report generation
  const generatePDFReport = async () => {
    try {
      setShowReportModal(true);
      const report = await NetworkService.generateReport();
      setReportData(report);
      
      // Wait for report modal content to render
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const element = document.getElementById('network-report');
      if (!element) {
        addNotification('Failed to generate report: Could not find report element', 'error');
        setShowReportModal(false);
        return;
      }
      
      const canvas = await html2canvas(element);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add content to PDF
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297);
      pdf.save(`network-report-${new Date().toISOString().slice(0,10)}.pdf`);
      
      addNotification('Report generated successfully', 'success');
    } catch (error) {
      addNotification('Failed to generate report', 'error');
    } finally {
      setShowReportModal(false);
    }
  };

  // Health status styling
  const getHealthStatusClass = useMemo(() => {
    if (!metrics) return 'bg-neutral';
    switch (metrics.health) {
      case 'optimal': return 'bg-success text-success-content';
      case 'good': return 'bg-info text-info-content';
      case 'warning': return 'bg-warning text-warning-content';
      case 'critical': return 'bg-error text-error-content';
      default: return 'bg-neutral';
    }
  }, [metrics]);

  // Component rendering functions
  const renderOverviewTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Network Status Card */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">
            <Activity className="h-5 w-5" />
            Network Status
          </h2>
          <div className={`badge ${getHealthStatusClass} p-3 text-lg font-semibold`}>
            {metrics?.health.toUpperCase()}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="stat bg-base-200 rounded-box p-2">
              <div className="stat-title">Signal</div>
              <div className="stat-value text-lg">{metrics?.signalStrength}%</div>
              <progress 
                className={`progress w-full ${
                  (metrics?.signalStrength || 0) > 70 ? 'progress-success' :
                  (metrics?.signalStrength || 0) > 50 ? 'progress-warning' :
                  'progress-error'
                }`}
                value={metrics?.signalStrength}
                max="100"
              />
            </div>

            <div className="stat bg-base-200 rounded-box p-2">
              <div className="stat-title">Devices</div>
              <div className="stat-value text-lg">{metrics?.connectedDevices}</div>
              <div className="stat-desc">{metrics?.networkType}</div>
            </div>
          </div>

          <div className="divider">Network Details</div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Channel Width</span>
              <span className="badge badge-primary">{metrics?.channelWidth || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Frequency</span>
              <span className="badge badge-secondary">{metrics?.frequency || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>SNR</span>
              <span className="badge badge-accent">{metrics?.snr || 'N/A'} dB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Speed Test Card */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">
            <Zap className="h-5 w-5" />
            Speed Test
          </h2>

          <button
            className={`btn btn-primary w-full ${testInProgress ? 'loading' : ''}`}
            onClick={async () => {
              setTestInProgress(true);
              try {
                const results = await NetworkService.runSpeedTest();
                addNotification('Speed test completed successfully', 'success');
              } catch (error) {
                addNotification('Speed test failed', 'error');
              } finally {
                setTestInProgress(false);
              }
            }}
            disabled={testInProgress}
          >
            {testInProgress ? 'Running Test...' : 'Start Speed Test'}
          </button>

          <div className="space-y-4 mt-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Download</span>
                <span>{metrics?.download.toFixed(1)} Mbps</span>
              </div>
              <progress 
                className="progress progress-info w-full" 
                value={metrics?.download} 
                max="200"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Upload</span>
                <span>{metrics?.upload.toFixed(1)} Mbps</span>
              </div>
              <progress 
                className="progress progress-success w-full" 
                value={metrics?.upload} 
                max="100"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="stat bg-base-200 rounded-box p-2">
                <div className="stat-title">Latency</div>
                <div className="stat-value text-lg">{metrics?.latency.toFixed(1)}ms</div>
              </div>
              <div className="stat bg-base-200 rounded-box p-2">
                <div className="stat-title">Jitter</div>
                <div className="stat-value text-lg">{metrics?.jitter.toFixed(1)}ms</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Overview Card */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">
            <Shield className="h-5 w-5" />
            Security Overview
          </h2>
          
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Security Score</div>
              <div className="stat-value text-primary">
                {metrics?.security.score}/10
              </div>
              <div className="stat-desc">
                Last scan: {metrics?.security.lastScan ? new Date(metrics.security.lastScan).toLocaleTimeString() : 'N/A'}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold mb-2">Active Security Features</h3>
            <div className="flex flex-wrap gap-2">
              {metrics?.security.activeFeatures?.map(feature => (
                <span key={feature} className="badge badge-outline">
                  {feature}
                </span>
              )) || <span className="text-sm text-gray-500">No active features</span>}
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-center text-sm">
              <span>Threats Blocked (24h)</span>
              <span className="font-semibold">{metrics?.security.threats || 0}</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-2">
              <span>Vulnerabilities</span>
              <span className={`font-semibold ${
                metrics?.security.vulnerabilities ? 
                (metrics.security.vulnerabilities.high + metrics.security.vulnerabilities.medium + metrics.security.vulnerabilities.low) > 0 ? 
                'text-error' : 'text-success' : 'text-success'
              }`}>
                {metrics?.security.vulnerabilities ? 
                  (metrics.security.vulnerabilities.high + metrics.security.vulnerabilities.medium + metrics.security.vulnerabilities.low) : 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Network Performance Chart */}
      <div className="card bg-base-100 shadow-xl lg:col-span-3">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title">
              <Globe className="h-5 w-5" />
              Network Performance History
            </h2>
            <select 
              className="select select-bordered select-sm"
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
            >
              <option value="1h">Last Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
            </select>
          </div>

          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalData}>
                <defs>
                  <linearGradient id="colorDownload" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CONFIG.COLORS.primary} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={CONFIG.COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorUpload" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CONFIG.COLORS.secondary} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={CONFIG.COLORS.secondary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
                  contentStyle={{ backgroundColor: 'hsl(var(--b1))', borderColor: 'hsl(var(--b3))' }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="download" 
                  name="Download Speed"
                  stroke={CONFIG.COLORS.primary} 
                  fill="url(#colorDownload)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="upload" 
                  name="Upload Speed"
                  stroke={CONFIG.COLORS.secondary} 
                  fill="url(#colorUpload)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  // Device Management Tab
  const renderDevicesTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Connected Devices</h2>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Device</th>
                    <th>IP Address</th>
                    <th>Signal</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map(device => (
                    <tr key={device.id}>
                      <td>
                        <div className="flex items-center space-x-3">
                          <MonitorSmartphone className="h-5 w-5" />
                          <div>
                            <div className="font-bold">{device.name}</div>
                            <div className="text-sm opacity-50">{device.type}</div>
                          </div>
                        </div>
                      </td>
                      <td>{device.ip}</td>
                      <td>
                        <progress 
                          className="progress progress-success w-24" 
                          value={device.signalStrength} 
                          max="100"
                        />
                      </td>
                      <td>
                        <span className={`badge ${
                          device.securityStatus === 'secure' ? 'badge-success' : 'badge-warning'
                        }`}>
                          {device.securityStatus}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-ghost"
                          onClick={() => setSelectedDevice(device)}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {selectedDevice && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Device Details</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Device Name</label>
                <input 
                  type="text" 
                  className="input input-bordered w-full" 
                  value={selectedDevice.name}
                  readOnly
                />
              </div>
              <div>
                <label className="label">MAC Address</label>
                <input 
                  type="text" 
                  className="input input-bordered w-full" 
                  value={selectedDevice.mac}
                  readOnly
                />
              </div>
              <div>
                <label className="label">Protocol</label>
                <input 
                  type="text" 
                  className="input input-bordered w-full" 
                  value={selectedDevice.protocol}
                  readOnly
                />
              </div>
              <div>
                <label className="label">Data Usage</label>
                <div className="stats shadow w-full">
                  <div className="stat">
                    <div className="stat-title">Download</div>
                    <div className="stat-value text-primary">
                      {(selectedDevice.dataUsage.download / 1000).toFixed(2)} GB
                    </div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Upload</div>
                    <div className="stat-value text-secondary">
                      {(selectedDevice.dataUsage.upload / 1000).toFixed(2)} GB
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDiagnosticResults = () => {
    if (!diagnosticResults) return null;
    
    const { result } = diagnosticResults;
    const { success, command, error } = result;
    
    if (!success) {
  return (
        <div className="p-4 mt-4 border rounded-lg bg-red-50 border-red-200">
          <h3 className="text-lg font-semibold text-red-700 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" /> 
            Diagnostic Failed
          </h3>
          <p className="mt-2 text-red-600">{error || 'Unknown error occurred'}</p>
          <p className="mt-1 text-sm text-red-500">Command: {command}</p>
          </div>
      );
    }
    
    if (command.includes('ping')) {
      const pingResult = result.result as any;
      return (
        <div className="p-4 mt-4 border rounded-lg bg-green-50 border-green-200">
          <h3 className="text-lg font-semibold text-green-700 flex items-center">
            <Check className="w-5 h-5 mr-2" /> 
            Ping Results for {pingResult.host}
          </h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Packets Sent</p>
              <p className="text-2xl font-bold">{pingResult.sent}</p>
        </div>
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Packets Received</p>
              <p className="text-2xl font-bold">{pingResult.received}</p>
          </div>
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Packet Loss</p>
              <p className={`text-2xl font-bold ${pingResult.packetLoss > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                {pingResult.packetLoss}%
              </p>
        </div>
      </div>

          <div className="mt-4">
            <h4 className="font-medium text-gray-700">Response Times</h4>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <div className="p-2 bg-white rounded border">
                <p className="text-xs text-gray-500">Min</p>
                <p className="font-bold">{pingResult.times?.min || 0} ms</p>
              </div>
              <div className="p-2 bg-white rounded border">
                <p className="text-xs text-gray-500">Avg</p>
                <p className="font-bold">{pingResult.times?.avg || 0} ms</p>
              </div>
              <div className="p-2 bg-white rounded border">
                <p className="text-xs text-gray-500">Max</p>
                <p className="font-bold">{pingResult.times?.max || 0} ms</p>
              </div>
            </div>
          </div>
          
          {pingResult.roundtrip && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-700">Round Trip Details</h4>
              <div className="mt-2 overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sequence</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TTL</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pingResult.roundtrip.map((trip: any, index: number) => (
                      <tr key={index}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{trip.sequence}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{trip.time} ms</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{trip.ttl}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="p-4 mt-4 border rounded-lg bg-green-50 border-green-200">
        <h3 className="text-lg font-semibold text-green-700 flex items-center">
          <Check className="w-5 h-5 mr-2" /> 
          Diagnostic Completed Successfully
        </h3>
        <pre className="mt-4 p-3 bg-gray-800 text-gray-100 rounded overflow-x-auto">
          {JSON.stringify(result.result, null, 2)}
        </pre>
      </div>
    );
  };

  // Add this useEffect for the topology animations at the top level
  useEffect(() => {
    if (!topologyData) return;
    
    // Initialize animatedNodes with false
    const nodeAnimations: {[key: string]: boolean} = {};
    topologyData.nodes.forEach(node => {
      nodeAnimations[node.id] = false;
    });
    
    // Animate nodes one by one with a slight delay
    const animateNodes = async () => {
      for (const node of topologyData.nodes) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setAnimatedNodes(prev => ({ ...prev, [node.id]: true }));
      }
    };
    
    animateNodes();
    
    // Add zoom functionality
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * -0.01;
      const newScale = Math.min(Math.max(0.5, scale + delta), 2);
      setScale(newScale);
    };
    
    const svgElement = svgRef.current;
    if (svgElement) {
      svgElement.addEventListener('wheel', handleWheel);
    }
    
    return () => {
      if (svgElement) {
        svgElement.removeEventListener('wheel', handleWheel);
      }
    };
  }, [topologyData, scale]);

  // Add these helper functions for the topology at the top level of NetworkOptimizer
  const handleNodeMouseDown = useCallback((nodeId: string, e: React.MouseEvent) => {
    if (!svgRef.current || !topologyData) return;
    
    const svgPoint = svgRef.current.createSVGPoint();
    svgPoint.x = e.clientX;
    svgPoint.y = e.clientY;
    
    setDragNode(nodeId);
    setIsDragging(true);
    
    // Find and update the initial position of the node
    const node = topologyData.nodes.find(n => n.id === nodeId);
    if (node) {
      // Store initial position
      setInitialPosition({ x: node.position.x, y: node.position.y });
    }
  }, [topologyData]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragNode || !topologyData || !svgRef.current) return;
    
    const node = topologyData.nodes.find(n => n.id === dragNode);
    if (node) {
      const svgPoint = svgRef.current.createSVGPoint();
      svgPoint.x = e.clientX;
      svgPoint.y = e.clientY;
      
      // Get transformed point in SVG coordinates
      const transformedPoint = svgPoint.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
      
      // Update node position
      node.position.x = transformedPoint.x;
      node.position.y = transformedPoint.y;
      
      // Force update
      setTopologyData({ nodes: [...topologyData.nodes], connections: topologyData.connections });
    }
  }, [isDragging, dragNode, topologyData]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragNode(null);
  }, []);

  // Now replace the entire renderTopology function with this version that doesn't use hooks internally
  const renderTopology = () => {
    if (!topologyData) return null;
    
    const { nodes, connections } = topologyData;
    
    const getDeviceIcon = (type: string) => {
      switch (type) {
        case 'router': return <Router className="h-6 w-6 text-blue-500" />;
        case 'modem': return <Globe className="h-6 w-6 text-green-500" />;
        case 'mesh': return <Network className="h-6 w-6 text-purple-500" />;
        case 'smartphone': return <MonitorSmartphone className="h-6 w-6 text-red-400" />;
        case 'laptop': return <Server className="h-6 w-6 text-amber-500" />;
        case 'tablet': return <Cpu className="h-6 w-6 text-cyan-500" />;
        case 'smarthome': return <Zap className="h-6 w-6 text-green-400" />;
        case 'tv': return <MonitorSmartphone className="h-6 w-6 text-orange-400" />;
        default: return <HelpCircle className="h-6 w-6 text-gray-400" />;
      }
    };
    
    const getConnectionStyle = (status: string, type: string, isHovered: boolean) => {
      let baseColor = 'stroke-green-500';
      let animatedColor = 'stroke-green-400';
      let strokeWidth = isHovered ? 3 : 2;
      let strokeDasharray = '';
      
      if (status === 'weak') {
        baseColor = 'stroke-orange-500';
        animatedColor = 'stroke-orange-400';
      } else if (status === 'issue') {
        baseColor = 'stroke-red-500';
        animatedColor = 'stroke-red-400';
      }
      
      if (type === 'wireless') {
        strokeDasharray = '5,5';
      }
      
      return {
        className: `${baseColor} transition-all duration-300 ease-in-out`,
        animatedClassName: `${animatedColor}`,
        strokeWidth,
        strokeDasharray
      };
    };
    
    return (
      <div className="relative w-full h-[600px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
        <div className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 z-10">
          <div className="flex flex-col space-y-3">
            <h3 className="text-xs font-semibold text-gray-700 mb-1">Network Legend</h3>
            <div className="flex items-center text-xs">
              <div className="w-4 h-1 bg-green-500 mr-2 rounded-full"></div>
              <span className="text-gray-700">Active Connection</span>
            </div>
            <div className="flex items-center text-xs">
              <div className="w-4 h-1 bg-orange-500 mr-2 rounded-full"></div>
              <span className="text-gray-700">Weak Connection</span>
            </div>
            <div className="flex items-center text-xs">
              <div className="w-4 h-1 bg-red-500 mr-2 rounded-full"></div>
              <span className="text-gray-700">Issue</span>
            </div>
            <div className="flex items-center text-xs">
              <div className="w-4 h-0.5 border border-dashed border-gray-500 mr-2"></div>
              <span className="text-gray-700">Wireless</span>
            </div>
            <div className="flex items-center text-xs">
              <div className="w-4 h-1 bg-gray-500 mr-2 rounded-full"></div>
              <span className="text-gray-700">Wired</span>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-4 right-4 flex space-x-2 z-10">
        <button 
            className="btn btn-circle btn-sm"
            onClick={() => setScale(prev => Math.min(prev + 0.1, 2))}
        >
            <Plus className="h-4 w-4" />
        </button>
        <button 
            className="btn btn-circle btn-sm"
            onClick={() => setScale(prev => Math.max(prev - 0.1, 0.5))}
        >
            <Minus className="h-4 w-4" />
        </button>
        <button 
            className="btn btn-circle btn-sm"
            onClick={() => setScale(1)}
          >
            <Maximize2 className="h-4 w-4" />
        </button>
      </div>

        <svg 
          ref={svgRef}
          width="100%" 
          height="100%" 
          viewBox="0 0 100 100" 
          className="text-sm cursor-move"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <g transform={`scale(${scale})`}>
            {/* Draw connections first so they appear behind nodes */}
            {connections.map((connection, index) => {
              // Find source and target nodes
              const source = nodes.find(n => n.id === connection.source);
              const target = nodes.find(n => n.id === connection.target);
              
              if (!source || !target) return null;
              
              const isHovered = hoveredNode === source.id || hoveredNode === target.id;
              const connectionStyle = getConnectionStyle(connection.status, connection.type, isHovered);
              
              // Calculate path for smooth curves
              const dx = target.position.x - source.position.x;
              const dy = target.position.y - source.position.y;
              const dr = Math.sqrt(dx * dx + dy * dy) * 1.2;
              
              // Animation dots for data flow
              const isAnimated = animatedNodes[source.id] && animatedNodes[target.id];
              
              return (
                <g key={`connection-${index}`}>
                  {connection.type === 'wireless' ? (
                    <path
                      d={`M${source.position.x},${source.position.y} L${target.position.x},${target.position.y}`}
                      className={connectionStyle.className}
                      strokeWidth={connectionStyle.strokeWidth}
                      strokeDasharray={connectionStyle.strokeDasharray}
                      fill="none"
                    />
                  ) : (
                    <path
                      d={`M${source.position.x},${source.position.y} Q${(source.position.x + target.position.x) / 2 + (dy > 0 ? 10 : -10)},${(source.position.y + target.position.y) / 2} ${target.position.x},${target.position.y}`}
                      className={connectionStyle.className}
                      strokeWidth={connectionStyle.strokeWidth}
                      strokeDasharray={connectionStyle.strokeDasharray}
                      fill="none"
                    />
                  )}
                  
                  {/* Data flow animation */}
                  {isAnimated && (
                    <>
                      {[0.2, 0.5, 0.8].map((offset, i) => (
                        <circle
                          key={`dot-${index}-${i}`}
                          r="0.6"
                          fill={connection.status === 'issue' ? '#EF4444' : connection.status === 'weak' ? '#F97316' : '#10B981'}
                          opacity={0.8}
                        >
                          <animateMotion
                            path={connection.type === 'wireless' ? 
                              `M${source.position.x},${source.position.y} L${target.position.x},${target.position.y}` : 
                              `M${source.position.x},${source.position.y} Q${(source.position.x + target.position.x) / 2 + (dy > 0 ? 10 : -10)},${(source.position.y + target.position.y) / 2} ${target.position.x},${target.position.y}`
                            }
                            begin={`${i * 0.5}s`}
                            dur="2s"
                            repeatCount="indefinite"
                            keyPoints={`${offset}; 1`}
                            keyTimes="0; 1"
                            calcMode="linear"
                          />
                        </circle>
                      ))}
        </>
      )}
                </g>
              );
            })}
            
            {/* Draw nodes on top */}
            {nodes.map((node, index) => {
              const isSelected = selectedDevice?.id === node.id;
              const isHovered = hoveredNode === node.id;
              const isAnimated = animatedNodes[node.id];
              
              return (
                <g
                  key={`node-${index}`}
                  transform={`translate(${node.position.x - 3}, ${node.position.y - 3})`}
                  className={`cursor-pointer transition-transform duration-300 ${isDragging && dragNode === node.id ? 'cursor-grabbing' : 'cursor-grab'}`}
                  onClick={() => setSelectedDevice(node as any)}
                  onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  style={{
                    opacity: isAnimated ? 1 : 0,
                    transform: `translate(${node.position.x - 3}px, ${node.position.y - 3}px) scale(${isHovered || isSelected ? 1.1 : 1})`,
                    transition: 'opacity 0.5s ease-in-out, transform 0.3s ease-in-out'
                  }}
                >
                  {/* Highlight effect for selected node */}
                  {isSelected && (
                    <circle
                      cx="3"
                      cy="3"
                      r="5"
                      className="fill-primary/20 animate-pulse"
                    />
                  )}
                  
                  {/* Node highlight on hover */}
                  {isHovered && !isSelected && (
                    <circle
                      cx="3"
                      cy="3"
                      r="4.5"
                      className="fill-blue-100/50"
                    />
                  )}
                  
                  {/* Node circle */}
                  <circle
                    cx="3"
                    cy="3"
                    r="3.5"
                    className={`fill-white shadow-sm transition-all duration-300 ${
                      node.status === 'active' ? 'stroke-green-500' :
                      node.status === 'issue' ? 'stroke-red-500' : 'stroke-orange-500'
                    } ${isSelected || isHovered ? 'stroke-[1.5]' : 'stroke-1'}`}
                  />
                  
                  {/* Device icon */}
                  <foreignObject
                    width="10"
                    height="10"
                    x="-3"
                    y="-3"
                    className="pointer-events-none"
                  >
                    <div className="flex items-center justify-center w-full h-full">
                      {getDeviceIcon(node.type)}
                    </div>
                  </foreignObject>
                  
                  {/* Node name with background for better readability */}
                  <g transform="translate(0, 8)">
                    <rect
                      x="-10"
                      y="-1.5"
                      width="20"
                      height="3"
                      rx="1"
                      className="fill-white/80"
                    />
                    <text
                      x="0"
                      y="0.5"
                      textAnchor="middle"
                      className="text-[0.12rem] fill-gray-800 font-medium pointer-events-none"
                    >
                      {node.name}
                    </text>
                  </g>
                  
                  {/* Activity indicator */}
                  <circle
                    cx="5.5"
                    cy="0.5"
                    r="0.8"
                    className={`${
                      node.status === 'active' ? 'fill-green-500' :
                      node.status === 'issue' ? 'fill-red-500' : 'fill-orange-500'
                    }`}
                  >
                    {node.status === 'active' && (
                      <animate
                        attributeName="opacity"
                        values="1;0.3;1"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    )}
                  </circle>
                </g>
              );
            })}
          </g>
        </svg>
        
        {selectedDevice && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-gray-200 animate-slideUp">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold flex items-center">
                  {getDeviceIcon(selectedDevice.type)}
                  <span className="ml-2">{selectedDevice.name}</span>
                </h3>
                <p className="text-sm text-gray-600">Type: {selectedDevice.type.charAt(0).toUpperCase() + selectedDevice.type.slice(1)}</p>
                {/* Handle both topology node status and network device status */}
                {'status' in selectedDevice ? (
                  <p className="text-sm text-gray-600">Status: 
                    <span className={`ml-1 font-medium ${
                      selectedDevice.status === 'active' ? 'text-green-500' :
                      selectedDevice.status === 'issue' ? 'text-red-500' : 'text-orange-500'
                    }`}>
                      {typeof selectedDevice.status === 'string' ? 
                        selectedDevice.status.charAt(0).toUpperCase() + selectedDevice.status.slice(1) : 
                        'Unknown'}
                    </span>
                  </p>
                ) : ('securityStatus' in selectedDevice ? (
                  <p className="text-sm text-gray-600">Status: 
                    <span className={`ml-1 font-medium ${
                      selectedDevice.securityStatus === 'secure' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {selectedDevice.securityStatus.charAt(0).toUpperCase() + selectedDevice.securityStatus.slice(1)}
                    </span>
                  </p>
                ) : null)}
                  </div>
              <div className="flex gap-2">
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => {
                    addNotification(`Running diagnostic on ${selectedDevice.name}`, 'info');
                    setTimeout(() => {
                      addNotification(`Diagnostic complete for ${selectedDevice.name}`, 'success');
                    }, 2000);
                  }}
                >
                  <Activity className="h-4 w-4 mr-1" />
                  Diagnose
                </button>
                <button 
                  className="btn btn-sm btn-circle"
                  onClick={() => setSelectedDevice(null)}
                >
                  <X className="h-4 w-4" />
                </button>
                </div>
              </div>

            {/* Add connection info if it's a topology node */}
            {'status' in selectedDevice && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-xs text-gray-500">Connections</p>
                  <p className="text-base font-medium">
                    {connections.filter(c => c.source === selectedDevice.id || c.target === selectedDevice.id).length}
                  </p>
                    </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-xs text-gray-500">Connection Quality</p>
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div 
                        key={i}
                        className={`w-2 h-4 mx-0.5 rounded-sm ${
                          selectedDevice.status === 'active' && i < 5 ? 'bg-green-500' :
                          selectedDevice.status === 'weak' && i < 3 ? 'bg-orange-500' :
                          selectedDevice.status === 'issue' && i < 2 ? 'bg-red-500' : 'bg-gray-200'
                        }`}
                      ></div>
                    ))}
                    </div>
                    </div>
                    </div>
            )}
        </div>
      )}
      </div>
    );
  };

  // Add renderSecurityTab function below renderDevicesTab function
  const renderSecurityTab = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">
                <Shield className="h-5 w-5" />
                Security Score
              </h2>
              <div className="flex items-center justify-center p-4">
            <div 
              className="radial-progress text-primary" 
              style={NetworkService._getProgressStyle(metrics?.security.score || 0)}
            >
              {metrics?.security.score}/10
                </div>
              </div>
              <div className="space-y-2">
                {CONFIG.SECURITY_FEATURES.map(feature => (
                  <div key={feature} className="flex items-center justify-between">
                    <span>{feature}</span>
                    <span className={`badge ${
                  metrics?.security.activeFeatures?.includes(feature) 
                        ? 'badge-success' 
                        : 'badge-error'
                    }`}>
                  {metrics?.security.activeFeatures?.includes(feature) ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">
                <AlertTriangle className="h-5 w-5" />
                Security Events
              </h2>
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Event</th>
                      <th>Device</th>
                      <th>Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                {metrics?.anomalies.filter(a => a.type.includes('Security')).map((event, index) => (
                  <tr key={index}>
                    <td>{new Date(event.timestamp).toLocaleTimeString()}</td>
                    <td>{event.description}</td>
                    <td>{devices.length > 0 ? devices[Math.floor(Math.random() * devices.length)].name : 'Unknown'}</td>
                    <td>
                      <span className={`badge ${
                        event.severity === 'high' ? 'badge-error' :
                        event.severity === 'medium' ? 'badge-warning' : 'badge-info'
                      }`}>
                        {event.severity.charAt(0).toUpperCase() + event.severity.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
                {/* Add some mock events if no security anomalies */}
                {(!metrics?.anomalies.some(a => a.type.includes('Security'))) && (
                  <>
                    <tr>
                      <td>{new Date().toLocaleTimeString()}</td>
                      <td>Suspicious Login Attempt</td>
                      <td>192.168.1.100</td>
                      <td><span className="badge badge-warning">Medium</span></td>
                    </tr>
                    <tr>
                      <td>{new Date(Date.now() - 300000).toLocaleTimeString()}</td>
                      <td>Port Scan Detected</td>
                      <td>192.168.1.150</td>
                      <td><span className="badge badge-error">High</span></td>
                    </tr>
                  </>
                )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

      {/* Firewall Rules */}
      <div className="lg:col-span-3 card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title">
              <Lock className="h-5 w-5" />
              Firewall Rules
            </h2>
            <button 
              className="btn btn-sm btn-outline"
              onClick={() => {
                NetworkService.getFirewallRules()
                  .then(rules => {
                    setFirewallRules(rules);
                    addNotification('Firewall rules refreshed', 'success');
                  })
                  .catch(error => {
                    addNotification('Failed to load firewall rules', 'error');
                  });
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Rules
            </button>
        </div>

          {!firewallRules ? (
            <div className="flex flex-col justify-center items-center h-[200px]">
              <Lock className="h-16 w-16 text-gray-400 mb-4" />
              <p>Firewall rules not loaded</p>
              <button 
                className="btn btn-primary mt-4"
                onClick={() => {
                  NetworkService.getFirewallRules()
                    .then(rules => {
                      setFirewallRules(rules);
                      addNotification('Firewall rules loaded', 'success');
                    })
                    .catch(error => {
                      addNotification('Failed to load firewall rules', 'error');
                    });
                }}
              >
                Load Firewall Rules
              </button>
            </div>
          ) : (
            <>
              <div className="form-control mb-4">
                <label className="label cursor-pointer justify-start">
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary" 
                    checked={firewallRules.enabled}
                    onChange={() => {
                      const updatedRules = {
                        ...firewallRules,
                        enabled: !firewallRules.enabled
                      };
                      setFirewallRules(updatedRules);
                      addNotification(`Firewall ${updatedRules.enabled ? 'enabled' : 'disabled'}`, 'success');
                    }}
                  />
                  <span className="label-text ml-2">Enable Firewall</span>
                </label>
              </div>

              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Protocol</th>
                      <th>Source</th>
                      <th>Destination</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {firewallRules.rules.map(rule => (
                      <tr key={rule.id}>
                        <td>{rule.name}</td>
                        <td>
                          <span className={`badge ${
                            rule.type === 'Block' ? 'badge-error' : 'badge-success'
                          }`}>
                            {rule.type}
                          </span>
                        </td>
                        <td>{rule.protocol}</td>
                        <td>
                          <div className="text-sm">
                            <div>{rule.sourceIP}</div>
                            <div className="text-xs opacity-70">Port: {rule.sourcePort}</div>
                          </div>
                        </td>
                        <td>
                          <div className="text-sm">
                            <div>{rule.destinationIP}</div>
                            <div className="text-xs opacity-70">Port: {rule.destinationPort}</div>
                          </div>
                        </td>
                        <td>
                          <input 
                            type="checkbox" 
                            className="toggle toggle-sm toggle-success" 
                            checked={rule.enabled}
                            onChange={() => {
                              const updatedRules = {
                                ...firewallRules,
                                rules: firewallRules.rules.map(r => 
                                  r.id === rule.id ? { ...r, enabled: !r.enabled } : r
                                )
                              };
                              setFirewallRules(updatedRules);
                              addNotification(`Rule ${rule.name} ${rule.enabled ? 'disabled' : 'enabled'}`, 'success');
                            }}
                          />
                        </td>
                        <td>
                          <div className="tooltip" data-tip={rule.description}>
                            <HelpCircle className="h-4 w-4 text-gray-400" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mt-4">
                <div className="badge badge-neutral mr-2">Default Policy: {firewallRules.defaultPolicy}</div>
                <div className="badge badge-neutral mr-4">Security Level: {firewallRules.securityLevel}</div>
                <div className="text-sm text-gray-500">Last Updated: {new Date(firewallRules.lastUpdated).toLocaleString()}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Add renderOptimizationTab function
  const renderOptimizationTab = () => (
    <div className="grid grid-cols-1 gap-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
          <div className="flex justify-between items-center mb-4">
              <h2 className="card-title">
              <TrendingUp className="h-5 w-5" />
              Network Optimization
              </h2>
            <button 
              className="btn btn-sm btn-outline"
              onClick={() => {
                NetworkService.getChannelAnalysis()
                  .then(data => {
                    setChannelAnalysis(data);
                    addNotification('Channel analysis refreshed', 'success');
                  })
                  .catch(error => {
                    addNotification('Failed to refresh channel analysis', 'error');
                  });
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Analysis
            </button>
          </div>

          {!metrics?.optimization ? (
            <div className="flex flex-col justify-center items-center h-[300px]">
              <Sparkles className="h-16 w-16 text-gray-400 mb-4" />
              <p>Optimization data not available</p>
            </div>
          ) : (
            <div>
              <div className="bg-base-200 p-4 rounded-lg mb-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Network Health Status</h3>
                    <p className="mb-4">
                      Your network is currently running at
                      <span className={`font-bold ml-1 ${
                        metrics.optimization.status === 'optimal' ? 'text-success' : 'text-warning'
                      }`}>
                        {metrics.optimization.status === 'optimal' ? 'optimal performance' : 'suboptimal performance'}
                      </span>
                    </p>
                  </div>
                  <div className="flex-none">
                    <div className="radial-progress text-primary" style={{
                      "--value": metrics.optimization.status === 'optimal' ? 95 : 75,
                      "--size": "8rem"
                    } as React.CSSProperties}>
                      {metrics.optimization.status === 'optimal' ? 
                        <Check className="h-8 w-8" /> : 
                        '75%'
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Optimization Features */}
              <h3 className="font-semibold mb-4">Optimization Techniques</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {CONFIG.OPTIMIZATION_TECHNIQUES.map(technique => {
                  const isActive = Math.random() > 0.5;
                  
                  return (
                    <div 
                      key={technique.id} 
                      className={`card bg-base-200 hover:shadow-md transition-shadow ${
                        isActive ? 'border-2 border-success' : ''
                      }`}
                    >
                      <div className="card-body p-4">
                        <h3 className="card-title text-base">{technique.name}</h3>
                        <p className="text-sm">{technique.description}</p>
                        <div className="card-actions justify-end mt-2">
                          {isActive ? (
                            <span className="badge badge-success">Active</span>
                          ) : (
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={() => {
                                setOptimizationInProgress(true);
                                NetworkService.applyOptimizationTechnique(technique.id)
                                  .then(result => {
                                    setOptimizationResults(result);
                                    addNotification(`Applied ${technique.name}`, 'success');
                                  })
                                  .catch(error => {
                                    addNotification(`Failed to apply ${technique.name}`, 'error');
                                  })
                                  .finally(() => setOptimizationInProgress(false));
                              }}
                              disabled={optimizationInProgress}
                            >
                              {optimizationInProgress ? 'Applying...' : 'Apply'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Wi-Fi Channel Analysis */}
              <div className="divider">Wi-Fi Channel Analysis</div>
              
              {!channelAnalysis ? (
                <div className="flex flex-col justify-center items-center h-[200px]">
                  <Radio className="h-16 w-16 text-gray-400 mb-4" />
                  <p>Channel analysis not loaded</p>
                  <button 
                    className="btn btn-primary mt-4"
                    onClick={() => {
                      NetworkService.getChannelAnalysis()
                        .then(data => {
                          setChannelAnalysis(data);
                          addNotification('Channel analysis loaded', 'success');
                        })
                        .catch(error => {
                          addNotification('Failed to load channel analysis', 'error');
                        });
                    }}
                  >
                    Load Channel Analysis
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="card bg-base-200">
                    <div className="card-body">
                      <h3 className="card-title text-base">2.4GHz Channels</h3>
                      <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={channelAnalysis.analysis2G}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis dataKey="channel" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="quality" name="Quality" fill={CONFIG.COLORS.success} />
                            <Bar dataKey="utilization" name="Utilization" fill={CONFIG.COLORS.warning} />
                            <Bar dataKey="interference" name="Interference" fill={CONFIG.COLORS.error} />
                            <ReferenceLine y={75} stroke={CONFIG.COLORS.info} strokeDasharray="3 3" />
                          </BarChart>
                </ResponsiveContainer>
              </div>
                      <div className="mt-2">
                        <div className="flex justify-between">
                          <span>Current: Channel {channelAnalysis.currentSettings.channel2G}</span>
                          <span>Recommended: Channel {channelAnalysis.recommendations.channel2G}</span>
                        </div>
              </div>
            </div>
          </div>

                  <div className="card bg-base-200">
                    <div className="card-body">
                      <h3 className="card-title text-base">5GHz Channels</h3>
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={channelAnalysis.analysis5G}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis dataKey="channel" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="quality" name="Quality" fill={CONFIG.COLORS.success} />
                            <Bar dataKey="utilization" name="Utilization" fill={CONFIG.COLORS.warning} />
                            <Bar dataKey="interference" name="Interference" fill={CONFIG.COLORS.error} />
                            <ReferenceLine y={75} stroke={CONFIG.COLORS.info} strokeDasharray="3 3" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between">
                          <span>Current: Channel {channelAnalysis.currentSettings.channel5G}</span>
                          <span>Recommended: Channel {channelAnalysis.recommendations.channel5G}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2 card bg-base-200">
                    <div className="card-body">
                      <h3 className="card-title text-base">Current Wi-Fi Settings</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-medium">2.4GHz</h4>
                          <div className="space-y-2 mt-2">
                            <div className="flex justify-between">
                              <span>Channel</span>
                              <span className="badge">{channelAnalysis.currentSettings.channel2G}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Width</span>
                              <span className="badge">{channelAnalysis.currentSettings.width2G}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>TX Power</span>
                              <span className="badge">{channelAnalysis.currentSettings.txPower2G}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium">5GHz</h4>
                          <div className="space-y-2 mt-2">
                            <div className="flex justify-between">
                              <span>Channel</span>
                              <span className="badge">{channelAnalysis.currentSettings.channel5G}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Width</span>
                              <span className="badge">{channelAnalysis.currentSettings.width5G}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>TX Power</span>
                              <span className="badge">{channelAnalysis.currentSettings.txPower5G}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium">Recommendations</h4>
                          <div className="space-y-2 mt-2">
                            <div className="alert alert-info py-2 text-sm">
                              <div>
                                <AlertCircle className="h-4 w-4 mr-2" />
                                <span>{channelAnalysis.recommendations.reason}</span>
                              </div>
                            </div>
                            <button 
                              className="btn btn-sm btn-primary w-full"
                              onClick={() => {
                                addNotification('Applied recommended channel settings', 'success');
                              }}
                            >
                              Apply Recommendations
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Optimization Results */}
              {optimizationResults && (
                <div className={`alert ${optimizationResults.success ? 'alert-success' : 'alert-error'} mt-6`}>
                  <div>
                    {optimizationResults.success ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <AlertTriangle className="h-6 w-6" />
                    )}
                    <span>{optimizationResults.message}</span>
                  </div>
                  {optimizationResults.success && optimizationResults.results && (
                    <div className="flex gap-4">
                      <span>Improvement: {optimizationResults.results.improvement}</span>
                      <span className="text-xs opacity-70">{optimizationResults.results.details}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Add renderQoSTab function
  const renderQoSTab = () => (
    <div className="grid grid-cols-1 gap-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
          <div className="flex justify-between items-center mb-4">
              <h2 className="card-title">
              <Sliders className="h-5 w-5" />
              Quality of Service Settings
              </h2>
            <button 
              className="btn btn-sm btn-outline"
              onClick={() => {
                NetworkService.getQoSSettings()
                  .then(data => {
                    setQosSettings(data);
                    addNotification('QoS settings loaded', 'success');
                  })
                  .catch(error => {
                    addNotification('Failed to load QoS settings', 'error');
                  });
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          {!qosSettings ? (
            <div className="flex flex-col justify-center items-center h-[300px]">
              <Sliders className="h-16 w-16 text-gray-400 mb-4" />
              <p>QoS settings not loaded</p>
              <button 
                className="btn btn-primary mt-4"
                onClick={() => {
                  NetworkService.getQoSSettings()
                    .then(data => {
                      setQosSettings(data);
                      addNotification('QoS settings loaded', 'success');
                    })
                    .catch(error => {
                      addNotification('Failed to load QoS settings', 'error');
                    });
                }}
              >
                Load QoS Settings
              </button>
            </div>
          ) : (
                <div>
              <div className="form-control mb-6">
                <label className="label cursor-pointer justify-start">
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary" 
                    checked={qosSettings.enabled}
                    onChange={() => {
                      const updatedSettings = {
                        ...qosSettings,
                        enabled: !qosSettings.enabled
                      };
                      NetworkService.updateQoSSettings(updatedSettings)
                        .then(() => {
                          setQosSettings(updatedSettings);
                          addNotification('QoS ' + (updatedSettings.enabled ? 'enabled' : 'disabled'), 'success');
                        })
                        .catch(error => {
                          addNotification('Failed to update QoS settings', 'error');
                        });
                    }}
                  />
                  <span className="label-text ml-2">Enable Quality of Service (QoS)</span>
                </label>
                  </div>

              <div className="divider">Service Priorities</div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {qosSettings.servicePriorities.map((service, index) => (
                  <div key={index} className="flex items-center justify-between bg-base-200 p-3 rounded-lg">
                    <div className="flex items-center">
                      <div className={`badge badge-${
                        service.priority === 'highest' ? 'error' :
                        service.priority === 'high' ? 'warning' :
                        service.priority === 'medium' ? 'info' :
                        service.priority === 'normal' ? 'success' : 'ghost'
                      } mr-3`}>
                        {service.priority}
                      </div>
                      <span>{service.name}</span>
                    </div>
                    <input 
                      type="checkbox" 
                      className="toggle toggle-sm toggle-primary" 
                      checked={service.enabled}
                      onChange={() => {
                        const updatedPriorities = [...qosSettings.servicePriorities];
                        updatedPriorities[index] = {
                          ...service,
                          enabled: !service.enabled
                        };
                        
                        const updatedSettings = {
                          ...qosSettings,
                          servicePriorities: updatedPriorities
                        };
                        
                        NetworkService.updateQoSSettings(updatedSettings)
                          .then(() => {
                            setQosSettings(updatedSettings);
                            addNotification(`${service.name} priority ${service.enabled ? 'disabled' : 'enabled'}`, 'success');
                          })
                          .catch(error => {
                            addNotification('Failed to update service priority', 'error');
                          });
                      }}
                  />
                </div>
                ))}
              </div>

              <div className="divider">Bandwidth Allocation</div>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Total Available Bandwidth</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="label">Download Bandwidth (Mbps)</label>
                    <input 
                      type="number" 
                      className="input input-bordered w-full" 
                      value={qosSettings.bandwidthRules.totalBandwidth.download}
                      onChange={(e) => {
                        const updatedSettings = {
                          ...qosSettings,
                          bandwidthRules: {
                            ...qosSettings.bandwidthRules,
                            totalBandwidth: {
                              ...qosSettings.bandwidthRules.totalBandwidth,
                              download: parseInt(e.target.value) || 0
                            }
                          }
                        };
                        setQosSettings(updatedSettings);
                      }}
                    />
                  </div>
                  <div>
                    <label className="label">Upload Bandwidth (Mbps)</label>
                    <input 
                      type="number" 
                      className="input input-bordered w-full" 
                      value={qosSettings.bandwidthRules.totalBandwidth.upload}
                      onChange={(e) => {
                        const updatedSettings = {
                          ...qosSettings,
                          bandwidthRules: {
                            ...qosSettings.bandwidthRules,
                            totalBandwidth: {
                              ...qosSettings.bandwidthRules.totalBandwidth,
                              upload: parseInt(e.target.value) || 0
                            }
                          }
                        };
                        setQosSettings(updatedSettings);
                      }}
                  />
                </div>
                  </div>
                  </div>

              <div className="card bg-base-200 p-4 rounded-lg mb-6">
                <h3 className="font-semibold mb-4">Priority Bandwidth Allocation</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={qosSettings.bandwidthRules.priorityAllocation}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="priority" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="downloadPercent" name="Download %" fill={CONFIG.COLORS.primary} />
                      <Bar dataKey="uploadPercent" name="Upload %" fill={CONFIG.COLORS.secondary} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="divider">Device Priorities</div>
              
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Device</th>
                      <th>Type</th>
                      <th>Priority</th>
                      <th>Bandwidth Limits</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qosSettings.devicePriorities.map((device, index) => (
                      <tr key={index}>
                        <td>{device.name}</td>
                        <td>{device.type}</td>
                        <td>
                          <select 
                            className="select select-bordered select-sm"
                            value={device.priority}
                            onChange={(e) => {
                              const updatedDevices = [...qosSettings.devicePriorities];
                              updatedDevices[index] = {
                                ...device,
                                priority: e.target.value
                              };
                              
                              const updatedSettings = {
                                ...qosSettings,
                                devicePriorities: updatedDevices
                              };
                              
                              NetworkService.updateQoSSettings(updatedSettings)
                                .then(() => {
                                  setQosSettings(updatedSettings);
                                  addNotification(`Updated priority for ${device.name}`, 'success');
                                })
                                .catch(error => {
                                  addNotification('Failed to update device priority', 'error');
                                });
                            }}
                          >
                            <option value="highest">Highest</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="normal">Normal</option>
                            <option value="low">Low</option>
                          </select>
                        </td>
                        <td>
                          <div className="flex gap-2 items-center">
                            <span>{device.bandwidth.guaranteed}</span>
                            <span>-</span>
                            <span>{device.bandwidth.maximum} Mbps</span>
            </div>
                        </td>
                        <td>
                          <button className="btn btn-sm btn-ghost">
                            <Settings className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mt-6">
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    NetworkService.updateQoSSettings(qosSettings)
                      .then(() => {
                        addNotification('QoS settings saved successfully', 'success');
                      })
                      .catch(error => {
                        addNotification('Failed to save QoS settings', 'error');
                      });
                  }}
                >
                  Save Settings
                </button>
          </div>
        </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-6">
      {/* Header */}
      <div className="navbar bg-base-100 rounded-box mb-6 shadow-xl">
        <div className="flex-1">
          <div className="btn btn-ghost normal-case text-xl">
            <Network className="h-6 w-6 mr-2" />
            Network Optimizer
          </div>
        </div>
        <div className="flex-none">
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle">
              <Settings className="h-5 w-5" />
            </label>
            <ul tabIndex={0} className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
              <li><a onClick={() => setShowSettings(true)}>Settings</a></li>
              <li><a onClick={generatePDFReport}>Generate Report</a></li>
              <li><a onClick={() => setActiveTab('help')}>Help</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="tabs tabs-boxed mb-6">
        <button 
          className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'devices' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('devices')}
        >
          Devices
        </button>
        <button 
          className={`tab ${activeTab === 'topology' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('topology')}
        >
          Topology
        </button>
        <button 
          className={`tab ${activeTab === 'optimization' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('optimization')}
        >
          Optimization
        </button>
        <button 
          className={`tab ${activeTab === 'security' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
        <button 
          className={`tab ${activeTab === 'diagnostics' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('diagnostics')}
        >
          Diagnostics
        </button>
        <button 
          className={`tab ${activeTab === 'qos' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('qos')}
        >
          QoS
        </button>
      </div>

      {/* Loading State */}
      {metricsLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      )}

      {/* Error Alert */}
      {metricsError && (
        <div className="alert alert-error mb-4">
          <AlertCircle className="h-6 w-6" />
          <span>{metricsError}</span>
        </div>
      )}

      {/* Notifications */}
      <div className="toast toast-end">
        {notifications.map(({ id, message, type }) => (
          <div
            key={id}
            className={`alert ${
              type === 'error' ? 'alert-error' : 
              type === 'warning' ? 'alert-warning' : 
              'alert-success'
            }`}
          >
            <span>{message}</span>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      {!metricsLoading && metrics && (
        <>
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'devices' && renderDevicesTab()}
          {activeTab === 'topology' && (
            <div className="grid grid-cols-1 gap-6">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="card-title">
                      <Network className="h-5 w-5" />
                      Network Topology Map
                    </h2>
                    <div className="flex gap-2">
                      <button 
                        className="btn btn-sm btn-outline"
                        onClick={() => {
                          setTopologyLoading(true);
                          NetworkService.getNetworkTopology()
                            .then(data => {
                              setTopologyData(data);
                            })
                            .catch(error => {
                              addNotification('Failed to refresh topology', 'error');
                            })
                            .finally(() => setTopologyLoading(false));
                        }}
                        disabled={topologyLoading}
                      >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                      </button>
                      <div className="btn-group">
                        <button 
                          className={`btn btn-sm ${displayMode === 'visual' ? 'btn-active' : ''}`}
                          onClick={() => setDisplayMode('visual')}
                        >
                          Visual
                        </button>
                        <button 
                          className={`btn btn-sm ${displayMode === 'technical' ? 'btn-active' : ''}`}
                          onClick={() => setDisplayMode('technical')}
                        >
                          Technical
                        </button>
                      </div>
                    </div>
                  </div>

                  {topologyLoading ? (
                    <div className="flex justify-center items-center h-[400px]">
                      <div className="loading loading-spinner loading-lg"></div>
                    </div>
                  ) : (
                    <>
                      {!topologyData ? (
                        <div className="flex flex-col justify-center items-center h-[400px]">
                          <Map className="h-16 w-16 text-gray-400 mb-4" />
                          <p>Network topology data not loaded</p>
                          <button 
                            className="btn btn-primary mt-4"
                            onClick={() => {
                              setTopologyLoading(true);
                              NetworkService.getNetworkTopology()
                                .then(data => {
                                  setTopologyData(data);
                                })
                                .catch(error => {
                                  addNotification('Failed to load topology', 'error');
                                })
                                .finally(() => setTopologyLoading(false));
                            }}
                          >
                            Load Topology
                          </button>
                        </div>
                      ) : displayMode === 'visual' ? (
                        renderTopology()
                      ) : (
                        <div className="p-4 h-full overflow-auto">
                          <div className="overflow-x-auto">
                            <table className="table w-full">
                              <thead>
                                <tr>
                                  <th>Device</th>
                                  <th>Type</th>
                                  <th>Status</th>
                                  <th>Connections</th>
                                </tr>
                              </thead>
                              <tbody>
                                {topologyData.nodes.map(node => {
                                  const nodeConnections = topologyData.connections.filter(
                                    c => c.source === node.id || c.target === node.id
                                  );
                                  
                                  return (
                                    <tr key={node.id}>
                                      <td>{node.name}</td>
                                      <td className="capitalize">{node.type}</td>
                                      <td>
                                        <span className={`badge ${
                                          node.status === 'active' ? 'badge-success' :
                                          node.status === 'issue' ? 'badge-warning' : 'badge-error'
                                        }`}>
                                          {node.status}
                                        </span>
                                      </td>
                                      <td>
                                        {nodeConnections.length} 
                                        {nodeConnections.some(c => c.type === 'wired') && (
                                          <span className="badge badge-sm ml-2">Wired</span>
                                        )}
                                        {nodeConnections.some(c => c.type === 'wireless') && (
                                          <span className="badge badge-sm badge-outline ml-2">Wireless</span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Diagnostics Tab */}
          {activeTab === 'diagnostics' && (
            <div className="grid grid-cols-1 gap-6">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="card-title">
                      <Activity className="h-5 w-5" />
                      Network Diagnostics
                    </h2>
                    <button 
                      className="btn btn-sm btn-outline"
                      onClick={() => {
                        NetworkService.runDiagnosticTool('ping', { host: '8.8.8.8' })
                          .then(result => {
                            setDiagnosticResults({
                              toolId: 'ping',
                              toolName: 'Ping Test',
                              result: result
                            });
                          })
                          .catch(error => {
                            addNotification('Failed to run diagnostic', 'error');
                          });
                      }}
                    >
                      <RefreshCw className="h-4 w-4" />
                      Run Diagnostic
                    </button>
                  </div>

                  {renderDiagnosticResults()}
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && renderSecurityTab()}

          {/* Optimization Tab */}
          {activeTab === 'optimization' && renderOptimizationTab()}

          {/* QoS Tab */}
          {activeTab === 'qos' && renderQoSTab()}
        </>
      )}
    </div>
  );
};

export default NetworkOptimizer;
      