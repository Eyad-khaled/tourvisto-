import {
  MapsComponent,
  LayersDirective,
  LayerDirective,
  SidebarComponent,
} from "../src/syncfusion";
import MobileBar from "../components/MobileBar";
import "../src/App.css";
import NavItems from "../components/NavItems";
import Header from "../components/Header";
import { useEffect, useMemo, useState } from "react";
import { comboBoxItems, selectItems } from "../app/constants";
import { formatKey } from "../app/lib/utils";
import { world_map } from "../app/constants/world_map";
import { useNavigate } from "react-router-dom";
import { action } from "./api/create-trip";
import type { FormEvent } from "react";
import { Combobox } from "../components/ComboBox";
import { useAppContext } from "@/contexts/appContext";
import countries from "../app/constants/countries.json";

type CountryOption = {
  name: string;
  value: string;
  countryCode: string;
  coordinates: number[];
  openStreetMap: string;
};

type TripFormData = {
  country: string;
  travelStyle: string;
  interest: string;
  budget: string;
  duration: number;
  groupType: string;
  userId: string;
};

type TripSelectKey = Extract<
  keyof TripFormData,
  "groupType" | "travelStyle" | "interest" | "budget"
>;

const countryData = countries as CountryOption[];

const CreateTrips = () => {
  const navigate = useNavigate();
  const { user } = useAppContext();

  const [CountriesData, setCountriesData] = useState<
    { text: string; value: string }[]
  >([]);

  const [FormData, setFormData] = useState<TripFormData>({
    country: "",
    travelStyle: "",
    interest: "",
    budget: "",
    duration: 0,
    groupType: "",
    userId: "",
  });

  const [Loading, setLoading] = useState(false);
  const [Error, setError] = useState<string | null>(null);

  const selectableKeys = selectItems as TripSelectKey[];

  // Build the dropdown once from the local JSON.
  useEffect(() => {
    setCountriesData(
      countryData.map((country) => ({
        text: country.name,
        value: country.value,
      }))
    );
  }, []);

  const selectedCountry = useMemo(
    () => countryData.find((country) => country.name === FormData.country),
    [FormData.country]
  );

  // Syncfusion only needs the country name for shapeDataPath.
  // The coordinates remain available in selectedCountry for future use.
  const MapData = useMemo(() => {
    if (!selectedCountry) return [];

    return [
      {
        country: selectedCountry.name,
        color: "#ea382e",
        coordinates: selectedCountry.coordinates,
      },
    ];
  }, [selectedCountry]);

  const handleChange = <K extends keyof TripFormData>(
    key: K,
    value: TripFormData[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("🔥 SUBMIT FIRED");
    console.log("FormData:", FormData);

    setError(null);
    setLoading(true);

    if (
      !FormData.country ||
      !FormData.budget ||
      !FormData.duration ||
      !FormData.groupType ||
      !FormData.interest ||
      !FormData.travelStyle
    ) {
      setError("Please Provide Data For All Fields");
      setLoading(false);
      return;
    }

    if (!user?.$id) {
      setError("User not authenticated. Please log in first.");
      setLoading(false);
      return;
    }

    try {
      console.log("🚀 Calling create-trip action...");

      const response = await action(
        {
          ...FormData,
          userId: user.$id,
        },
        setLoading
      );

      console.log("✅ Trip generated:", response);

      if (response?.$id) {
        navigate(`/trips/${response.$id}`);
      } else {
        setError("Failed to generate trip. Please try again.");
        setLoading(false);
      }
    } catch (error) {
      console.error("🔥 Error generating trip:", error);

      setError(
        `Error generating trip: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );

      setLoading(false);
    }
  };

  return (
    <div className="admin-layout">
      <MobileBar />

      <aside className="w-full max-w-[270px] hidden lg:block">
        <SidebarComponent width={270} enableGestures={false}>
          <NavItems />
        </SidebarComponent>
      </aside>

      <main className="dashboard wrapper md:pt-10">
        <Header
          title="Add New Trips"
          desc="View And Generate Ai Trips"
        />

        <section className="mt-2.5 wrapper-md">
          <form
            className="trip-form"
            onSubmit={handleSubmit}
          >
            {/* COUNTRY */}
            <div>
              <label htmlFor="country">Country</label>

              <Combobox
                id="country"
                dataSource={CountriesData}
                placeholder="Select A Country"
                value={FormData.country}
                change={(e) =>
                  handleChange("country", e.value as string)
                }
              />
            </div>

            {/* DURATION */}
            <div>
              <label htmlFor="duration">Duration</label>

              <input
                min={1}
                max={10}
                type="number"
                id="duration"
                placeholder="Enter A Number Of Days"
                name="duration"
                className="form-input placeholder:text-gray-100"
                value={FormData.duration || ""}
                onChange={(e) => {
                  const value = Number(e.target.value);

                  if (value > 10) {
                    alert("Enter a number of days between 1 and 10");
                    return;
                  }

                  handleChange("duration", value);
                }}
              />
            </div>

            {/* OTHER SELECTS */}
            {selectableKeys.map((key) => (
              <div key={key}>
                <label htmlFor={key}>
                  {formatKey(key)}
                </label>

                <Combobox
                  id={key}
                  dataSource={(
                    comboBoxItems as Record<TripSelectKey, string[]>
                  )[key].map((value) => ({
                    text: value,
                    value,
                  }))}
                  placeholder={`Select A ${formatKey(key)}`}
                  value={FormData[key]}
                  change={(e) =>
                    handleChange(
                      key,
                      e.value as TripFormData[typeof key]
                    )
                  }
                />
              </div>
            ))}

            {/* MAP */}
            <div>
              <label htmlFor="location">
                Location On World Map
              </label>

              <MapsComponent>
                <LayersDirective>
                  <LayerDirective
                    dataSource={MapData}
                    shapeData={world_map}
                    shapePropertyPath="name"
                    shapeDataPath="country"
                    shapeSettings={{
                      colorValuePath: "color",
                      fill: "#e5e5e5ff",
                    }}
                  />
                </LayersDirective>
              </MapsComponent>
            </div>

            <div className="bg-gray-200 h-px w-full" />

            {Error && (
              <div className="error">
                <p>{Error}</p>
              </div>
            )}

            <footer className="px-6">
              <button
                type="submit"
                className="button-class !h-12 !w-full"
                disabled={Loading}
              >
                <img
                  src={`/assets/icons/${
                    Loading ? "loader.svg" : "magic-star.svg"
                  }`}
                  className={`size-5 ${
                    Loading ? "animate-spin" : ""
                  }`}
                  alt=""
                />

                <span className="p-16-semibold text-white">
                  {Loading
                    ? "Generating..."
                    : "Generate Trip"}
                </span>
              </button>
            </footer>
          </form>
        </section>
      </main>
    </div>
  );
};

export default CreateTrips;