import React, { useState, useEffect } from "react";
import "./App.css";
import {
  FormControl,
  Select,
  MenuItem,
  Card,
  CardContent,
} from "@material-ui/core";
import InfoBox from "./component/InfoBox";
import Map from "./component/Map";
import Table from "./component/Table";
import numeral from "numeral";
import { sortData, prettyPrintStat } from "./util";
import LineGraph from "./component/LineGraph";
import "leaflet/dist/leaflet.css";
// do robienia wykresow https://www.chartjs.org/

function App() {
  const [country, setInputCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [countries, setCountries] = useState([]);
  const [mapCountries, setMapCountries] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  // center
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);

  // get data from api
  useEffect(() => {
    const getCountriesData = async () => {
      const api = "https://disease.sh/v3/covid-19/countries";
      await fetch(api)
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({
            name: country.country, //poland united states
            value: country.countryInfo.iso2, //PL USA
          }));
          let sortedData = sortData(data);
          //
          setCountries(countries);
          setMapCountries(data);
          setTableData(sortedData);
        });
    };
    getCountriesData();
  }, []);

  const onCountryChange = async (e) => {
    const countryCode = e.target.value;
    console.log(countryCode);
    const url =
      countryCode === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    console.log(url);
    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setInputCountry(countryCode);

        //all of the data
        //from the country response
        setCountryInfo(data);
        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(4);
      });
  };
  console.log("country info >>>>>>>>>", country);

  return (
    <>
      <div className="app">
        <div className="app__left">
          <div className="app__header">
            {/* header  */}
            {/* title +select input dropdown field */}
            <h1>Kwiorzeczy Kovid-19 traker</h1>
            <FormControl className="app__dropdown">
              <Select
                variant="outlined"
                // kiedy cos zostanie wybrane z rozwijanego menu odpala funkcje onCountrychange
                onChange={onCountryChange}
                value={country}
              >
                {/*  */}
                <MenuItem value="worldwide">worldwide</MenuItem>
                {/* loop all countries */}
                {countries.map((country) => (
                  <MenuItem value={country.value}>{country.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div className="app__stats">
            <InfoBox
              active={casesType === "cases"}
              onClick={(e) => setCasesType("cases")}
              title="Coronavirus Cases"
              cases={prettyPrintStat(countryInfo.todayCases)}
              total={prettyPrintStat(countryInfo.cases)}
            />
            {/* infoboxs title cprpmavoris cases */}
            <InfoBox
              active={casesType === "recovered"}
              onClick={(e) => setCasesType("recovered")}
              title="Recovered"
              cases={prettyPrintStat(countryInfo.todayRecovered)}
              total={prettyPrintStat(countryInfo.recovered)}
            />
            {/* infoboxs  title coronavirus recoveries*/}
            <InfoBox
              active={casesType === "deaths"}
              onClick={(e) => setCasesType("deaths")}
              title="Deaths"
              cases={prettyPrintStat(countryInfo.todayDeaths)}
              total={prettyPrintStat(countryInfo.deaths)}
            />
            {/* infoboxs */}
          </div>
          {/* map */}
          <Map
            casesType={casesType}
            countries={mapCountries}
            casesType={casesType}
            center={mapCenter}
            zoom={mapZoom}
          />
        </div>
        {/*  */}
        <Card className="app__right">
          <CardContent>
            <h3>lives cases by country</h3>
            {/* table */}
            <Table countries={tableData} />
            <h3>wordlwide new cases {casesType}</h3>
            {/* graph */}
            <LineGraph casesType={casesType} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default App;
