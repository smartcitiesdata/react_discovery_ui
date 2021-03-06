const dataStub = {
  metadata: {
    totalDatasets: 220,
    limit: 15,
    offset: 218,
    facets: {
      organization: {
        COTA: 1,
        Conduent: 1
      }
    }
  },
  results: [
    {
      title: 'COTA Transit Stops',
      description: 'This data identifies the transit stops on each COTA transit line. January stops dataset provides details about COTA stops from 01/01/3018 to 08/31/2018 Similarly, September...',
      fileTypes: ['FOO', 'BAR'],
      id: '0',
      modifiedTime: '2018-06-21',
      organization: 'neat COTA'
    },
    {
      title: 'Columbus City Parking Violations and Ticket Status 2013-2018',
      description: 'This dataset covers the parking violations identified by Parking Enforcement Officer (PEO) and the tickets issued for those violations. Also, the data identifies the status of...',
      fileTypes: ['CAT', 'DOG'],
      id: '1',
      modifiedTime: '2018-06-22',
      organization: 'Conduent'
    }
  ]
}

export default dataStub
