import { Selectors, Routes as routes } from '../support/search_page.js'
import { URLs as urls } from '../support/urls.js'
const all_datasets_name_asc = require('../fixtures/search_page_spec/all_datasets_name_asc')
const all_datasets_name_desc = require('../fixtures/search_page_spec/all_datasets_name_desc')
const all_datasets_last_modified = require('../fixtures/search_page_spec/all_datasets_last_modified')
const all_datasets_page_2 = require('../fixtures/search_page_spec/all_datasets_page_2')
const cotaDatasets = require('../fixtures/search_page_spec/cota_datasets')
const cogoDatasets = require('../fixtures/search_page_spec/cogo_datasets')
const bicycleDatasets = require('../fixtures/search_page_spec/bicycle_datasets')

const { sortSelectBox, datasetsFoundCount, paginator, dialogContent, search, datasets, firstDataset, 
  apiAccessibleCheckbox, organizations, cogoCheckBox, keywords, bicycleCheckBox} = Selectors

function isCoGoPage () {
  const numberOfOrganizations = Math.min(10, cogoDatasets.metadata.facets.organization.length)
  const numberOfKeywords = Math.min(10, cogoDatasets.metadata.facets.keywords.length)
  cy.url().should('match', urls.datasetSearchPage.cogoDatasets)
  cy.get(organizations).children('.checkbox').should('have.length', numberOfOrganizations)
  cy.get(keywords).children('.checkbox').should('have.length', numberOfKeywords)
}

function isBicyclePage () {
  const numberOfOrganizations = Math.min(10, bicycleDatasets.metadata.facets.organization.length)
  const numberOfKeywords = Math.min(10, bicycleDatasets.metadata.facets.keywords.length)
  cy.url().should('match', urls.datasetSearchPage.bicycleDatasets)
  cy.get(organizations).children('.checkbox').should('have.length', numberOfOrganizations)
  cy.get(keywords).children('.checkbox').should('have.length', numberOfKeywords)
}

function isFacetList () {
  const numberOfTotalKeywords = all_datasets_name_asc.metadata.facets.keywords.length
  cy.get(dialogContent).find('.section-header').contains('keywords')
  cy.get(dialogContent).find('.section').children('.checkbox').should('have.length', numberOfTotalKeywords)
}

describe('Search interactions on the page', function () {
  beforeEach(function () {
    cy.server()
    // cy.route(routes.allDatasetsNameAsc)
    cy.route(routes.info)
    cy.visit('/')
  })

  it('successfully loads', function () {
    const numberOfDatasetsOnFirstPage = all_datasets_name_asc.results.length
    const maximumNumberOfDatasetsPerPage = all_datasets_name_asc.metadata.limit
    const numberOfTotalDatasets = all_datasets_name_asc.metadata.totalDatasets
    const numberOfOrganizationsOnFirstPage = Math.min(10, all_datasets_name_asc.metadata.facets.organization.length)
    const numberOfKeywordsOnFirstPage = Math.min(10, all_datasets_name_asc.metadata.facets.keywords.length)
    const numberOfPages = Math.floor(numberOfTotalDatasets/maximumNumberOfDatasetsPerPage)+1
    const titleOfFirstDataset = all_datasets_name_asc.results[0].title
    cy.url().should('match', urls.datasetSearchPage.base)
    cy.get(organizations).children('.checkbox').should('have.length', numberOfOrganizationsOnFirstPage)
    cy.get(keywords).children('.checkbox').should('have.length', numberOfKeywordsOnFirstPage)
    cy.get(datasetsFoundCount).contains(`${numberOfTotalDatasets} datasets found`)
    cy.get(datasets).find('data-card').should('have.length', numberOfDatasetsOnFirstPage)
    cy.get(paginator).find('button.page-number').should('have.length', numberOfPages)
    cy.get(sortSelectBox).should('have.value', 'name_asc')
    cy.get(apiAccessibleCheckbox).should('have.class', 'selected')
    cy.get(firstDataset).contains(titleOfFirstDataset)
  })

  it('search works', function () {
    const numberOfTotalDatasets = cotaDatasets.metadata.totalDatasets
    const titleOfFirstDataset = cotaDatasets.results[0].title
    cy.route(routes.cotaDatasets)
    cy.get(search).type('COTA{enter}')
    cy.get(datasetsFoundCount).contains(`${numberOfTotalDatasets} datasets found for "COTA"`)
    cy.contains(titleOfFirstDataset)
  })

  it('API Accessible works', function() {
    cy.route(routes.apiAccessibleFalseDatasets)
    cy.get(apiAccessibleCheckbox).click()
    cy.get(apiAccessibleCheckbox).not('have.class', 'selected')
    cy.url().should('match', urls.datasetSearchPage.apiAccessible)
  })

  it('Dataset links work', function() {
    cy.route(routes.ogripDataset)
    cy.get(firstDataset).find('.details > .title').click()
    cy.url().should('match', urls.datasetDetailsPage.ogrip)
  })
})

describe('sort', function () {
  beforeEach(function () {
    cy.server()
    cy.route(routes.allDatasetsNameAsc)
    cy.route(routes.info)
    cy.route(routes.allDatasetsNameAsc).as('getDatasetsInAscendingOrderByName')
    cy.route(routes.allDatasetsNameDesc).as('getDatasetsInDescendingOrderByName')
    cy.route(routes.allDatasetsLastModified).as('getDatasetsByLastModifiedDate')
  })

  it('can sort by name descending', function () {
    const titleOfFirstDataset = all_datasets_name_desc.results[0].title
    cy.visit('/')
    cy.get(sortSelectBox).select('name_desc')
    cy.wait(['@getDatasetsInDescendingOrderByName'])
    cy.get(sortSelectBox).should('have.value', 'name_desc')
    cy.get(firstDataset).contains(titleOfFirstDataset)
  })

  it('can sort by last modified date', function () {
    const titleOfFirstDataset = all_datasets_last_modified.results[0].title
    cy.visit('/')
    cy.get(sortSelectBox).select('last_mod')
    cy.wait(['@getDatasetsByLastModifiedDate'])
    cy.get(sortSelectBox).should('have.value', 'last_mod')
    cy.get(firstDataset).contains(titleOfFirstDataset)
  })

  it('can sort by name ascending', function () {
    const titleOfFirstDataset = all_datasets_name_asc.results[0].title
    cy.visit('/?sort=name_desc')
    cy.get(sortSelectBox).select('name_asc')
    cy.wait(['@getDatasetsInAscendingOrderByName'])
    cy.get(sortSelectBox).should('have.value', 'name_asc')
    cy.get(firstDataset).contains(titleOfFirstDataset)
  })
})

describe('Facet interaction on the page', function() {
  beforeEach(function () {
    cy.server()
    cy.route(routes.allDatasetsNameAsc)
    cy.route(routes.info)
    cy.visit('/')
    cy.route(routes.cogoDatasets)
    cy.route(routes.bicycleDatasets)
  })

  it('Clicking an organization takes you to that organization\'s datasets', function () {
    cy.get(cogoCheckBox).click()
    isCoGoPage()
    cy.get(cogoCheckBox).click()
    cy.url().should('match', urls.datasetSearchPage.pageOne)
  })

  it('Clicking a keyword takes you to datasets with that keyword', function () {
    cy.get(bicycleCheckBox).click()
    isBicyclePage()
    cy.get(bicycleCheckBox).click()
    cy.url().should('match', urls.datasetSearchPage.pageOne)
  })

  it('Show more link works', function () {
    cy.get(keywords).contains('Show more').click()
    isFacetList()
  })

})

describe('Deep linking', function () {
  beforeEach(function () {
    cy.server()
    cy.route(routes.info)
  })

  it('sort desc works', function () {
    cy.route(routes.allDatasetsNameDesc)
    cy.route(routes.allDatasetsNameAsc)
    cy.visit('/?sort=name_desc')
    cy.get(sortSelectBox).should('have.value', 'name_desc')
    cy.visit('/?sort=name_asc')
    cy.get(sortSelectBox).should('have.value', 'name_asc')
  })

  it('api accessible works', function () {
    cy.route(routes.apiAccessibleFalseDatasets)
    cy.route(routes.allDatasetsNameAsc)
    cy.visit('/?apiAccessible=false')
    cy.get(apiAccessibleCheckbox).not('have.class', 'selected')
    cy.visit('/?apiAccessible=true')
    cy.get(apiAccessibleCheckbox).should('have.class', 'selected')
  })

  it('page=2 works', function () {
    const titleOfFirstDataset = all_datasets_page_2.results[0].title
    cy.route(routes.allDatasetsPage2)
    cy.visit('/?page=2')
    cy.get(firstDataset).contains(titleOfFirstDataset)
  })

  it('organization=COGO works', function () {
    const titleOfFirstDataset = cogoDatasets.results[0].title
    cy.route(routes.cogoDatasets)
    cy.visit('/?page=1&apiAccessible=true&facets%5Borganization%5D%5B%5D=COGO')
    cy.get(firstDataset).contains(titleOfFirstDataset)
  })
})