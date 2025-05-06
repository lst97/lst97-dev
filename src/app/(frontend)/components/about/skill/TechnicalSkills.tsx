import React, { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { ApexOptions } from 'apexcharts'
import {
  LanguageData,
  EditorData,
  OperatingSystemData,
  BaseBarData,
} from '@/frontend/models/Wakatime'
import { motion } from 'framer-motion'

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
})

// Define interfaces for various possible data structures
interface WakaTimeDataItem {
  name: string
  percent: number
  hours: number
  [key: string]: any // For other fields like color, text, etc.
}

interface NestedData {
  data?: WakaTimeDataItem[] | { data?: WakaTimeDataItem[] }
}

interface TechnicalSkillsProps {
  languages?: LanguageData | NestedData
  editors?: EditorData | NestedData
  operatingSystems?: OperatingSystemData | NestedData
  inView?: boolean
  isLoading?: boolean
  error?: string
}

// Theme constants
const THEME = {
  colors: {
    primary: '#b58900',
    secondary: '#ffe580',
    tertiary: '#fff3c4',
    quaternary: '#e0d7b3',
    quinary: '#d3ca9f',
    background: '#fffbeb',
    text: '#2c2c2c',
    border: '#2c2c2c',
    accent: '#4a4a4a',
  },
  fonts: {
    size: {
      small: '12px',
      base: '14px',
      large: '1rem',
      xl: '1.2rem',
      xxl: '1.5rem',
    },
    family: 'monospace',
  },
  borders: {
    width: {
      thin: '2px',
      normal: '4px',
      thick: '6px',
    },
    radius: '0',
  },
  spacing: {
    small: '0.5rem',
    medium: '1rem',
    large: '1.5rem',
  },
  animations: {
    duration: {
      fast: 0.3,
      medium: 0.5,
      slow: 0.8,
    },
  },
}

const chartColors = [
  THEME.colors.primary,
  THEME.colors.secondary,
  THEME.colors.tertiary,
  THEME.colors.quaternary,
  THEME.colors.quinary,
]

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: THEME.animations.duration.medium,
      when: 'beforeChildren',
      staggerChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: THEME.animations.duration.medium },
  },
}

// Base chart options
const getBaseChartOptions = (): ApexOptions => ({
  chart: {
    foreColor: THEME.colors.text,
    background: THEME.colors.background,
    animations: {
      enabled: true,
      speed: 800,
      animateGradually: {
        enabled: true,
        delay: 150,
      },
      dynamicAnimation: {
        enabled: true,
        speed: 350,
      },
    },
  },
  stroke: {
    width: parseInt(THEME.borders.width.thin),
    colors: [THEME.colors.border],
  },
  fill: {
    type: 'pattern',
    pattern: {
      style: 'squares',
      width: 6,
      height: 6,
    },
    colors: chartColors,
  },
})

// Loading state component
const LoadingState: React.FC = () => (
  <div className="flex justify-center items-center h-40 w-full">
    <div className="animate-pulse flex flex-col items-center">
      <div className="h-12 w-12 border-t-4 border-b-4 border-[#b58900] rounded-full animate-spin"></div>
      <p className="mt-4 font-['Press_Start_2P'] text-[#2c2c2c]">Loading skill data...</p>
    </div>
  </div>
)

// Error state component
interface ErrorStateProps {
  message?: string
}

const ErrorState: React.FC<ErrorStateProps> = ({ message }) => (
  <div className="flex justify-center items-center h-40 w-full bg-red-50 border-2 border-red-200">
    <p className="text-red-500 font-['Press_Start_2P'] text-center p-4">
      {message || 'Failed to load skill data. Please try again later.'}
    </p>
  </div>
)

// Accessibility data table component
interface AccessibilityDataTableProps {
  languages?: { name: string; percent: number; hours: number | string }[]
  editors?: { name: string; percent: number }[]
  operatingSystems?: { name: string; percent: number }[]
}

const AccessibilityDataTable: React.FC<AccessibilityDataTableProps> = ({
  languages = [],
  editors = [],
  operatingSystems = [],
}) => (
  <div className="sr-only">
    <h4>Programming Languages Usage</h4>
    <table>
      <thead>
        <tr>
          <th>Language</th>
          <th>Percentage</th>
          <th>Hours</th>
        </tr>
      </thead>
      <tbody>
        {languages.map((lang) => (
          <tr key={lang.name}>
            <td>{lang.name}</td>
            <td>{lang.percent.toFixed(1)}%</td>
            <td>{lang.hours}h</td>
          </tr>
        ))}
      </tbody>
    </table>

    <h4>Code Editors Usage</h4>
    <table>
      <thead>
        <tr>
          <th>Editor</th>
          <th>Percentage</th>
        </tr>
      </thead>
      <tbody>
        {editors.map((editor) => (
          <tr key={editor.name}>
            <td>{editor.name}</td>
            <td>{editor.percent.toFixed(1)}%</td>
          </tr>
        ))}
      </tbody>
    </table>

    <h4>Operating Systems Usage</h4>
    <table>
      <thead>
        <tr>
          <th>OS</th>
          <th>Percentage</th>
        </tr>
      </thead>
      <tbody>
        {operatingSystems.map((os) => (
          <tr key={os.name}>
            <td>{os.name}</td>
            <td>{os.percent.toFixed(1)}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

// DonutChart component
interface DonutChartProps {
  title: string
  data: { name: string; percent: number }[]
  inView: boolean
}

const DonutChart: React.FC<DonutChartProps> = ({ title, data, inView }) => {
  const donutChartOptions = (): ApexOptions => ({
    ...getBaseChartOptions(),
    chart: {
      ...getBaseChartOptions().chart,
      type: 'donut',
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: THEME.fonts.size.base,
              fontFamily: THEME.fonts.family,
              color: THEME.colors.text,
              offsetY: 0,
            },
            value: {
              show: true,
              fontSize: THEME.fonts.size.base,
              fontFamily: THEME.fonts.family,
              color: THEME.colors.text,
              offsetY: 8,
              formatter: function (val: string) {
                return parseFloat(val).toFixed(1) + '%'
              },
            },
            total: {
              show: true,
              label: 'Top',
              color: THEME.colors.text,
              formatter: function (w) {
                const maxValue = Math.max(...w.globals.seriesTotals)
                const maxIndex = w.globals.seriesTotals.indexOf(maxValue)
                return `${data[maxIndex].name} (${maxValue.toFixed(1)}%)`
              },
            },
          },
        },
        dataLabels: {
          offset: -5,
        },
      },
    },
    colors: chartColors,
    dataLabels: {
      enabled: false,
      style: {
        fontSize: THEME.fonts.size.base,
        fontFamily: THEME.fonts.family,
        colors: [THEME.colors.text],
      },
    },
    legend: {
      position: 'bottom',
      labels: {
        colors: THEME.colors.text,
      },
      markers: {
        fillColors: chartColors,
        size: 12,
        offsetX: -2,
      },
    },
    labels: data.map((item) => item.name),
    fill: {
      type: 'pattern',
      pattern: {
        style: Array(Math.ceil(data.length / 5))
          .fill(['squares', 'circles', 'diagonal', 'horizontal', 'vertical'])
          .flat(),
        width: 6,
        height: 6,
      },
    },
    tooltip: {
      enabled: false,
    },
    stroke: {
      width: parseInt(THEME.borders.width.thin),
      colors: [THEME.colors.border],
    },
  })

  if (!inView || data.length === 0) {
    return (
      <div className="h-[275px] flex items-center justify-center">
        <p className="text-[#2c2c2c] font-['Press_Start_2P']">
          No {title.toLowerCase()} data available
        </p>
      </div>
    )
  }

  return (
    <ReactApexChart
      options={donutChartOptions()}
      series={data.map((item) => item.percent)}
      type="donut"
      height={275}
      aria-label={`Chart showing usage percentage of different ${title.toLowerCase()}`}
    />
  )
}

// LanguageBarChart component
interface LanguageBarChartProps {
  languages: { name: string; percent: number; hours: number | string }[]
  inView: boolean
}

const LanguageBarChart: React.FC<LanguageBarChartProps> = ({ languages, inView }) => {
  const processedLanguages = languages.slice(0, 10)

  const languagesChartOptions = (): ApexOptions => ({
    ...getBaseChartOptions(),
    chart: {
      ...getBaseChartOptions().chart,
      type: 'bar',
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '70%',
        distributed: true,
        dataLabels: {
          position: 'top',
        },
        borderRadius: parseInt(THEME.borders.radius),
        columnWidth: '70%',
      },
    },
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      style: {
        colors: [THEME.colors.text],
        fontSize: THEME.fonts.size.base,
        fontFamily: THEME.fonts.family,
        fontWeight: 'bold',
      },
      background: {
        enabled: true,
        foreColor: THEME.colors.text,
        borderRadius: 2,
        padding: 4,
        opacity: 0.05,
        borderWidth: 1,
        borderColor: '#a8a8a8',
      },
      formatter: function (val: number, opts) {
        const dataPoint = processedLanguages[opts.dataPointIndex]
        return `${val.toFixed(1)}% (${dataPoint.hours}h)`
      },
      offsetX: 12,
      offsetY: 0,
    },
    xaxis: {
      categories: processedLanguages.map((lang) => lang.name),
      labels: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        show: true,
        style: {
          colors: processedLanguages.map(() => THEME.colors.text),
          fontSize: THEME.fonts.size.base,
          fontFamily: THEME.fonts.family,
          fontWeight: 'bold',
        },
      },
    },
    legend: {
      show: false,
    },
    tooltip: {
      enabled: true,
      theme: 'light',
      style: {
        fontSize: THEME.fonts.size.small,
        fontFamily: THEME.fonts.family,
      },
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const value = series[seriesIndex][dataPointIndex]
        const name = processedLanguages[dataPointIndex].name
        const hours = processedLanguages[dataPointIndex].hours

        return (
          '<div class="custom-tooltip" style="' +
          `padding: ${THEME.spacing.medium};` +
          `background-color: ${THEME.colors.border};` +
          `border: ${THEME.borders.width.thick} solid ${THEME.colors.accent};` +
          '">' +
          '<div style="' +
          `font-size: ${THEME.fonts.size.xl};` +
          `font-family: ${THEME.fonts.family};` +
          'font-weight: 600;' +
          `margin-bottom: ${THEME.spacing.small};` +
          `color: ${THEME.colors.tertiary};` +
          '">' +
          `${name}` +
          '</div>' +
          '<div style="' +
          `font-size: ${THEME.fonts.size.large};` +
          `font-family: ${THEME.fonts.family};` +
          'opacity: 0.8;' +
          'color: #ffffff;' +
          '">' +
          `${value.toFixed(1)}% (${hours}h)` +
          '</div>' +
          '</div>'
        )
      },
      x: {
        show: false,
      },
      y: {
        title: {
          formatter: () => '',
        },
      },
      marker: {
        show: false,
      },
      fixed: {
        enabled: false,
        position: 'topRight',
        offsetX: 0,
        offsetY: 0,
      },
    },
  })

  if (!inView || processedLanguages.length === 0) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <p className="text-[#2c2c2c] font-['Press_Start_2P']">No language data available</p>
      </div>
    )
  }

  return (
    <ReactApexChart
      options={languagesChartOptions()}
      series={[
        {
          name: 'Usage',
          data: processedLanguages.map((lang) => lang.percent),
        },
      ]}
      type="bar"
      height={600}
      aria-label="Chart showing usage percentage of different programming languages"
    />
  )
}

// Main component
const TechnicalSkills: React.FC<TechnicalSkillsProps> = ({
  languages,
  editors,
  operatingSystems,
  inView = false,
  isLoading = false,
  error,
}) => {
  // Extract languages data with proper typing
  const processedLanguages = useMemo(() => {
    // For debugging
    console.log('Languages in TechnicalSkills:', languages)

    if (!languages) return []

    let languagesArray: WakaTimeDataItem[] | null = null

    // Case 1: Direct array
    if (Array.isArray(languages)) {
      languagesArray = languages as WakaTimeDataItem[]
    }
    // Case 2: { data: [...] }
    else if (languages.data && Array.isArray(languages.data)) {
      languagesArray = languages.data as WakaTimeDataItem[]
    }
    // Case 3: { data: { data: [...] } }
    else {
      const nestedData = languages as NestedData
      if (
        nestedData.data &&
        typeof nestedData.data === 'object' &&
        !Array.isArray(nestedData.data)
      ) {
        const doubleNestedData = nestedData.data as { data?: WakaTimeDataItem[] }
        if (doubleNestedData.data && Array.isArray(doubleNestedData.data)) {
          languagesArray = doubleNestedData.data
        }
      }
    }

    return languagesArray
      ? [...languagesArray].sort((a, b) => b.percent - a.percent).slice(0, 10)
      : []
  }, [languages])

  // Similarly prepare editors data
  const processedEditors = useMemo(() => {
    if (!editors) return []

    let editorsArray: WakaTimeDataItem[] | null = null

    if (Array.isArray(editors)) {
      editorsArray = editors as WakaTimeDataItem[]
    } else if (editors.data && Array.isArray(editors.data)) {
      editorsArray = editors.data as WakaTimeDataItem[]
    } else {
      const nestedData = editors as NestedData
      if (
        nestedData.data &&
        typeof nestedData.data === 'object' &&
        !Array.isArray(nestedData.data)
      ) {
        const doubleNestedData = nestedData.data as { data?: WakaTimeDataItem[] }
        if (doubleNestedData.data && Array.isArray(doubleNestedData.data)) {
          editorsArray = doubleNestedData.data
        }
      }
    }

    return editorsArray || []
  }, [editors])

  // Similarly prepare OS data
  const processedOS = useMemo(() => {
    if (!operatingSystems) return []

    let osArray: WakaTimeDataItem[] | null = null

    if (Array.isArray(operatingSystems)) {
      osArray = operatingSystems as WakaTimeDataItem[]
    } else if (operatingSystems.data && Array.isArray(operatingSystems.data)) {
      osArray = operatingSystems.data as WakaTimeDataItem[]
    } else {
      const nestedData = operatingSystems as NestedData
      if (
        nestedData.data &&
        typeof nestedData.data === 'object' &&
        !Array.isArray(nestedData.data)
      ) {
        const doubleNestedData = nestedData.data as { data?: WakaTimeDataItem[] }
        if (doubleNestedData.data && Array.isArray(doubleNestedData.data)) {
          osArray = doubleNestedData.data
        }
      }
    }

    return osArray || []
  }, [operatingSystems])

  return (
    <motion.div
      className="relative bg-[#fffbeb] border-4 border-[#2c2c2c] p-8 my-4 shadow-[8px_8px_0_#2c2c2c] before:content-[''] before:-top-1 before:-left-1 before:-right-1 before:-bottom-1 before:border-2 before:border-[#2c2c2c] before:pointer-events-none after:content-[''] after:absolute after:inset-0 after:bg-[linear-gradient(45deg,transparent_45%,#2c2c2c_45%,#2c2c2c_55%,transparent_55%),linear-gradient(-45deg,transparent_45%,#2c2c2c_45%,#2c2c2c_55%,transparent_55%)] after:bg-[length:8px_8px] after:bg-[position:0_0,4px_0] after:opacity-10 after:pointer-events-none"
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={containerVariants}
      aria-label="Technical skills visualization"
    >
      <motion.div
        className="flex justify-between items-center mb-6 pb-4 border-b-2 border-dashed border-[#2c2c2c]"
        variants={itemVariants}
      >
        <h3 className="text-xl font-bold uppercase font-['Press_Start_2P'] text-[#2c2c2c]">
          Technical Skills
        </h3>
      </motion.div>

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <div className="grid grid-cols-[0.6fr_1.4fr] gap-8 lg:grid-cols-1">
          <motion.div
            className="flex flex-col gap-8 lg:flex-row lg:flex-wrap"
            variants={itemVariants}
          >
            <motion.div
              className="bg-[rgba(44,44,44,0.05)] p-4 border-2 border-[#2c2c2c] lg:flex-1 lg:min-w-[300px]"
              variants={itemVariants}
            >
              <h4 className="font-['Press_Start_2P'] text-base text-[#2c2c2c] mb-4 text-center uppercase tracking-wider">
                Code Editors
              </h4>
              <DonutChart title="Code Editors" data={processedEditors} inView={inView} />
            </motion.div>
            <motion.div
              className="bg-[rgba(44,44,44,0.05)] p-4 border-2 border-[#2c2c2c] lg:flex-1 lg:min-w-[300px]"
              variants={itemVariants}
            >
              <h4 className="font-['Press_Start_2P'] text-base text-[#2c2c2c] mb-4 text-center uppercase tracking-wider">
                Operating Systems
              </h4>
              <DonutChart title="Operating Systems" data={processedOS} inView={inView} />
            </motion.div>
          </motion.div>
          <motion.div
            className="bg-[rgba(44,44,44,0.05)] p-4 border-2 border-[#2c2c2c] lg:h-auto"
            variants={itemVariants}
          >
            <h4 className="font-['Press_Start_2P'] text-base text-[#2c2c2c] mb-4 text-center uppercase tracking-wider">
              Programming Languages
            </h4>
            <LanguageBarChart languages={processedLanguages} inView={inView} />
          </motion.div>
        </div>
      )}

      <AccessibilityDataTable
        languages={processedLanguages}
        editors={processedEditors}
        operatingSystems={processedOS}
      />
    </motion.div>
  )
}

export default TechnicalSkills
