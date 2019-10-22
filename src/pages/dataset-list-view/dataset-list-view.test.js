import { shallow } from "enzyme";
import DatasetListView from "./dataset-list-view";
import Paginator from "../../components/generic-elements/paginator";
import Select from "../../components/generic-elements/select";
import Search from "../../components/generic-elements/search";
import ErrorComponent from "../../components/generic-elements/error-component";
import LoadingElement from "../../components/generic-elements/loading-element";
import FacetSidebar from "../../components/facet-sidebar";
import Checkbox from "../../components/generic-elements/checkbox";

let subject;

describe("dataset list view", () => {
  beforeEach(() => {});
  describe("query string", () => {});

  describe("action dispatches", () => {
    it("initializes search parameters with any found in the url", () => {
      const updateDatasetSearchParams = jest.fn();
      subject = createSubject(
        { updateDatasetSearchParams },
        "?q=monkey&sort=name_desc&apiAccessible=true"
      );

      expect(updateDatasetSearchParams).toHaveBeenCalledWith({
        query: "monkey",
        sort: "name_desc",
        apiAccessible: true,
        facets: undefined,
        offset: 0
      });
    });

    it("adds search parameters when the search callback is invoked", () => {
      const updateDatasetSearchParams = jest.fn();
      subject = createSubject({ updateDatasetSearchParams });
      subject
        .find(Search)
        .props()
        .callback("my search criteria");

      expect(updateDatasetSearchParams).toHaveBeenCalledWith({
        query: "my search criteria",
        offset: 0
      });
    });

    it("adds sort parameters when the sort callback is invoked", () => {
      const updateDatasetSearchParams = jest.fn();
      subject = createSubject({ updateDatasetSearchParams });
      subject
        .find(Select)
        .props()
        .selectChangeCallback("stuff");

      expect(updateDatasetSearchParams).toHaveBeenCalledWith({
        sort: "stuff",
        offset: 0
      });
    });

    it("adds facets to query parameters when facet is clicked", () => {
      const updateDatasetSearchParams = jest.fn();
      subject = createSubject({ updateDatasetSearchParams });
      subject
        .find(FacetSidebar)
        .props()
        .clickHandler("organization", "stuff");

      expect(updateDatasetSearchParams).toHaveBeenCalledWith({
        facets: { organization: ["stuff"] },
        offset: 0
      });
    });

    it("adds additional facets to query parameters when a new facet is clicked", () => {
      const updateDatasetSearchParams = jest.fn();
      const searchParams = { facets: { organization: ["things"] } };
      subject = createSubject({ updateDatasetSearchParams, searchParams });
      subject
        .find(FacetSidebar)
        .props()
        .clickHandler("organization", "stuff");

      expect(updateDatasetSearchParams).toHaveBeenCalledWith({
        facets: { organization: ["things", "stuff"] },
        offset: 0
      });
    });

    it("removes facets in query parameters when a lone facet is toggled", () => {
      const updateDatasetSearchParams = jest.fn();
      const searchParams = { facets: { organization: ["things"] } };
      subject = createSubject({ updateDatasetSearchParams, searchParams });
      subject
        .find(FacetSidebar)
        .props()
        .clickHandler("organization", "things");

      expect(updateDatasetSearchParams).toHaveBeenCalledWith({
        facets: { organization: [] },
        offset: 0
      });
    });

    it("toggles facets in query parameters when facet is clicked and other facets exist", () => {
      const updateDatasetSearchParams = jest.fn();
      const searchParams = { facets: { keyword: ["things", "stuff"] } };
      subject = createSubject({ updateDatasetSearchParams, searchParams });
      subject
        .find(FacetSidebar)
        .props()
        .clickHandler("keyword", "things");

      expect(updateDatasetSearchParams).toHaveBeenCalledWith({
        facets: { keyword: ["stuff"] },
        offset: 0
      });
    });

    it("update search results when clicked", () => {
      const updateDatasetSearchParams = jest.fn();
      subject = createSubject({updateDatasetSearchParams, searchParams: {apiAccessible: false}});
      subject
        .find(Checkbox)
        .props()
        .clickHandler();

      expect(updateDatasetSearchParams).lastCalledWith({ apiAccessible: true });
    });
  });

  describe("renders correctly", () => {
    it("sets the paginator total count based on the props", () => {
      const expectedNumberOfPages = 4;
      subject = createSubject({ numberOfPages: expectedNumberOfPages });
      expect(subject.find(Paginator).props().numberOfPages).toEqual(
        expectedNumberOfPages
      );
    });

    it("shows error message when the error property is true", () => {
      subject = createSubject({ error: true });
      expect(subject.find(ErrorComponent)).toHaveLength(1);
    });

    it("shows a loading spinner when the loading property is true", () => {
      subject = createSubject({ isSearchLoading: true });
      expect(subject.find(LoadingElement)).toHaveLength(1);
    });

    it("does not show a loading spinner when the loading property is false", () => {
      subject = createSubject({ isSearchLoading: false });
      expect(subject.find(LoadingElement)).toHaveLength(0);
    });

    it("apiAccessible is checked when supplied property is true", () => {
      subject = createSubject({ searchParams: { apiAccessible: true } });
      expect(subject.find(Checkbox).props().selected).toBeTruthy();
    });

    it("apiAccessible is not checked when supplied property is false", () => {
      subject = createSubject({ searchParams: { apiAccessible: false } });
      expect(subject.find(Checkbox).props().selected).toBeFalsy();
    });
  });
});

function expectSearchStringContains(navigationSpy, string, historyIndex = 0) {
  expect(navigationSpy.mock.calls.length).toBeGreaterThan(historyIndex);
  expect(navigationSpy.mock.calls[historyIndex][0].search).toMatch(
    encodeURI(string)
  );
}

function createSubject(props, queryString = "") {
  const navigationSpy = props.navigationSpy || jest.fn();
  const datasetSearch = props.datasetSearch || jest.fn();
  const updateDatasetSearchParams =
    props.updateDatasetSearchParams || jest.fn();

  const defaultSearchParams = {
    limit: 10,
    offset: 0,
    apiAccessible: false,
    query: "",
    sort: "default"
  };

  const searchParams = Object.assign({}, defaultSearchParams, props.searchParams); 

  const defaultProps = {
    datasets: [],
    facets: [],
    totalDatasets: 12,
    error: false,
    loading: false,
    // history: { push: navigationSpy, location: {search: queryString} },
    history: { push: navigationSpy },
    datasetSearch: datasetSearch,
    updateDatasetSearchParams: updateDatasetSearchParams,
    location: { search: queryString },
    searchMetadata: {},
    searchResults: [],
    searchParams: searchParams,
    numberOfPages: 2
  };
  const propsWithDefaults = Object.assign({}, defaultProps, props);
  return shallow(<DatasetListView {...propsWithDefaults} />);
}
