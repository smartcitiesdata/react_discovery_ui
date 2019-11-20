import PropTypes from 'prop-types'
import './chart-view.scss'
import React, { useState } from 'react'
import { dereference } from 'react-chart-editor/lib'
import PlotlyEditor, { DefaultEditor } from 'react-chart-editor'
import plotly from 'plotly.js/dist/plotly'
import { cloneDeep } from 'lodash'

import 'react-chart-editor/lib/react-chart-editor.ie.css'

import LoadingElement from '../../components/generic-elements/loading-element'

const hasDataSources = dataSources => {
  return dataSources && Object.keys(dataSources).length > 0
}

const getDataSourceOptions = dataSources => {
  return Object.keys(dataSources).map(name => ({
    value: name,
    label: name,
  }))
}

const clearValues = datasources => {
  Object.keys(datasources).forEach((key) => {
    datasources[key] = []
  })
}

const ChartView = (props) => {
  const { dataSources, isLoading, autoFetchQuery, executeQuery, saveChart } = props

  const [data, updateData] = useState([])
  const [layout, updateLayout] = useState({})
  const [frames, updateFrames] = useState([])

  const updateState = (newData, newLayout, newFrames) => {
    updateData(newData)
    updateLayout(newLayout)
    updateFrames(newFrames)
  }

  React.useEffect(() => {
    if (autoFetchQuery) {
      executeQuery()
    }
  }, [autoFetchQuery])

  React.useEffect(() => {
    const clonedData = cloneDeep(data)
    dereference(clonedData, dataSources)
    updateData(clonedData)
  }, [dataSources])

  if (isLoading) {
    return (
      <chart-view>
        <LoadingElement />
      </chart-view>
    )
  }

  if (!hasDataSources(dataSources)) {
    return (
      <chart-view>
        <div className='no-data-message'>Unable to load data. You may need to revise your query.</div>
      </chart-view>
    )
  }

  const onUpdate = (data, layout, frames) => {
    var dataClone = cloneDeep(data)
    var dataSourceClone = cloneDeep(dataSources)

    updateState(data, layout, frames)
    clearValues(dataSourceClone)
    dereference(dataClone, dataSourceClone)
    saveChart({data: dataClone, layout, frames})
  }

  return (
    <chart-view>
      <PlotlyEditor
        data={data}
        layout={layout}
        frames={frames}
        dataSources={dataSources}
        dataSourceOptions={getDataSourceOptions(dataSources)}
        plotly={plotly}
        onUpdate={onUpdate}
        advancedTraceTypeSelector
        useResizeHandler
        config={{ mapboxAccessToken: window.MAPBOX_ACCESS_TOKEN }}
      >
        <DefaultEditor logoSrc={window.LOGO_URL} />
      </PlotlyEditor>
    </chart-view>
  )
}

ChartView.propTypes = {
  dataSources: PropTypes.object.isRequired,
  isQueryLoading: PropTypes.bool,
  autoFetchQuery: PropTypes.bool,
  executeQuery: PropTypes.func.isRequired
}

export default ChartView
