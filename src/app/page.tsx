"use client";
import { useFormik } from "formik";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import * as Yup from "yup";
import { MultiValue, SingleValue } from "react-select";

//Tipos de datos
interface CountryPhoneCode {
  label: string;
  value: string;
  code: string;
  flag: string;
}

interface InitialValues {
  activityEconomics: { value: string; label: string };
  activities: Array<{ value: string; label: string }>;
  phoneCode: CountryPhoneCode;
  phone: string;
  address: string;
  country: string;
}

//Estilos personalizados para react-select
const customStyles = {
  container: (provided: any) => ({
    ...provided,
    width: "calc(50% - 2rem)",
    maxWidth: "8rem",
  }),
  control: (provided: any) => ({
    ...provided,
    border: "none",
    backgroundColor: "transparent",
    boxShadow: "none",
    "&:hover": {
      border: "none",
      boxShadow: "none",
    },
  }),
  menu: (provided: any) => ({
    ...provided,
    width: "auto",
    minWidth: "100%",
  }),
  option: (provided: any) => ({
    ...provided,
    paddingRight: "2rem",
    whiteSpace: "nowrap",
  }),
};

// Opciones de actividades económicas
const activityOptions = [
  { value: "hoteleria", label: "Hotelería" },
  { value: "restaurantes", label: "Restaurantes" },
  { value: "tour-operator", label: "Tour Operador" },
];

const formatCountryOptionLabel = (option: any) => {
  return (
    <div className="flex flex-row items-center">
      <img src={option.flag} className="w-4 h-4" />
      <span className="ml-1 text-sm">{option.value}</span>
    </div>
  );
};

const formatOptionLabel = (option: any, { context }: any) => {
  if (context === "value") {
    return (
      <div className="flex items-center">
        <img src={option.flag} alt="" className="w-4 h-4" />
        <span className="ml-1 text-sm">{option.code}</span>
      </div>
    );
  }
  return <div>{option.label}</div>;
};

// Esquema de validación de Yup
const validationSchema = Yup.object({
  activities: Yup.array()
    .of(
      Yup.object().shape({
        value: Yup.string().required(),
        label: Yup.string().required(),
      })
    )
    .min(1, "Selecciona al menos una actividad económica")
    .required("Selecciona al menos una actividad económica"),
  phoneCode: Yup.object()
    .shape({
      code: Yup.string().required("Código de país es requerido"),
    })
    .required("Código de país es requerido"),
  phone: Yup.string().required("Número de teléfono es requerido"),
  address: Yup.string().required("Dirección es requerida"),
  country: Yup.string().required("País de origen es requerido"),
});

// Función para renderizar la opción de país
const countryItem = (country: any) => {
  return (
    <div className="flex flex-row items-center">
      <img
        src={country.flags.svg}
        alt={country.name.common}
        className="w-4 h-4"
      />
      <span className="ml-1 text-sm">{`(${country.idd?.root || ""}${
        country.idd?.suffixes?.[0] || ""
      }) ${country.name.common}`}</span>
    </div>
  );
};

export default function Home() {
  const initialValues: InitialValues = {
    activityEconomics: { value: "", label: "" },
    activities: [],
    country: "",
    phoneCode: { label: "+57", value: "+57", code: "+57", flag: "" },
    phone: "",
    address: "",
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: validationSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: (values) => {
      handleSubmit(values);
    },
  });

  const handleSubmit = (values: InitialValues) => {
    console.log(`\n
      Actividad económica: ${values.activityEconomics.value} \n
      Actividades económicas: ${values.activities
        .map((activity) => activity.value)
        .join(", ")} \n
      Teléfono: ${values.phoneCode.code} ${values.phone} \n
      Dirección: ${values.address} \n
      País: ${values.country}
      `);

    alert(`Formulario enviado correctamente: \n
        Actividad económica: ${values.activityEconomics.label} \n
        Actividades económicas: ${values.activities
          .map((activity) => activity.label)
          .join(", ")} \n
        Teléfono: ${values.phoneCode.code} ${values.phone} \n
        Dirección: ${values.address} \n
        País: ${values.country}
        `);
  };

  const loadCountryPhoneCodeOptions = async (inputValue: string) => {
    try {
      const response = await fetch("https://restcountries.com/v3.1/all");
      const data = await response.json();

      return data
        .filter((country: any) => {
          const countryName = country.name.common.toLowerCase();
          const countryCode =
            (country.idd?.root || "") + (country.idd?.suffixes?.[0] || "");
          const lowerInputValue = inputValue.toLowerCase();
          return (
            countryName.includes(lowerInputValue) ||
            countryCode.includes(lowerInputValue)
          );
        })
        .map((country: any) => ({
          label: countryItem(country),
          value: `${country.idd?.root || ""}${
            country.idd?.suffixes?.[0] || ""
          }`,
          flag: country.flags.svg,
          code: `${country.idd?.root || ""}${country.idd?.suffixes?.[0] || ""}`,
        }));
    } catch (error) {
      console.error("Error fetching countries: ", error);
      return [];
    }
  };

  const loadCountryOptions = async (inputValue: string) => {
    try {
      const response = await fetch("https://restcountries.com/v3.1/all");
      const data = await response.json();

      return data
        .filter((country: any) => {
          const countryName = country.name.common.toLowerCase();
          const lowerInputValue = inputValue.toLowerCase();
          return countryName.includes(lowerInputValue);
        })
        .map((country: any) => ({
          label: countryItem(country),
          value: country.name.common,
          flag: country.flags.svg,
        }));
    } catch (error) {
      console.error("Error fetching countries: ", error);
      return [];
    }
  };

  return (
    <main className="flex bg-blue-200 min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full bg-white max-w-screen-lg shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-blue-500">
          Formulario de Registro de Actividad Económica
        </h1>
        <form onSubmit={formik.handleSubmit} className="flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="flex flex-col">
              <label className="mb-2">Actividad económica</label>
              <Select
                name="activityEconomics"
                options={activityOptions}
                onChange={(
                  option: SingleValue<{ value: string; label: string }>
                ) => formik.setFieldValue("activityEconomics", option)}
                value={formik.values.activityEconomics}
                placeholder="Selecciona una actividad"
                onBlur={() => formik.setFieldTouched("activityEconomics", true)}
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-2">Teléfono personal</label>
              <div className="flex items-center">
                <div className="flex flex-row border border-gray-300 rounded flex-grow">
                  <AsyncSelect
                    cacheOptions
                    loadOptions={loadCountryPhoneCodeOptions}
                    defaultOptions
                    formatOptionLabel={formatOptionLabel}
                    styles={customStyles}
                    onChange={(option: SingleValue<CountryPhoneCode>) =>
                      formik.setFieldValue("phoneCode", option || { code: "" })
                    }
                    placeholder="+57"
                  />
                  <input
                    type="tel"
                    name="phone"
                    onChange={formik.handleChange}
                    value={formik.values.phone}
                    className="w-full px-2 bg-transparent"
                    placeholder="0000 - 0000"
                    onBlur={() => formik.setFieldTouched("phone", true)}
                  />
                </div>
              </div>
              {formik.touched.phone && formik.errors.phone && (
                <div className="text-red-500 text-sm">
                  {formik.errors.phone}
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <label className="mb-2">Actividades económicas</label>
              <Select
                isMulti
                name="activities"
                options={activityOptions}
                onChange={(
                  option: MultiValue<{ value: string; label: string }>
                ) => formik.setFieldValue("activities", option)}
                value={formik.values.activities}
                placeholder="Selecciona actividades"
                onBlur={() => formik.setFieldTouched("activities", true)}
              />
              {formik.touched.activities && formik.errors.activities && (
                <div className="text-red-500 text-sm">
                  {formik.errors.activities.toString()}
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <label className="mb-2">Dirección completa</label>
              <input
                type="text"
                name="address"
                onChange={formik.handleChange}
                value={formik.values.address}
                className="p-2 border border-gray-300 rounded"
                placeholder="Dirección"
                onBlur={() => formik.setFieldTouched("address", true)}
              />
              {formik.touched.address && formik.errors.address && (
                <div className="text-red-500 text-sm">
                  {formik.errors.address}
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <label className="mb-2">País de origen</label>
              <AsyncSelect
                cacheOptions
                loadOptions={loadCountryOptions}
                defaultOptions
                formatOptionLabel={formatCountryOptionLabel}
                onChange={(
                  option: SingleValue<{ value: string; label: string }>
                ) => formik.setFieldValue("country", option?.value || "")}
                placeholder="Selecciona un país"
                onBlur={() => formik.setFieldTouched("country", true)}
              />
              {formik.touched.country && formik.errors.country && (
                <div className="text-red-500 text-sm">
                  {formik.errors.country}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 mx-auto p-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Enviar
          </button>
        </form>
      </div>
    </main>
  );
}
