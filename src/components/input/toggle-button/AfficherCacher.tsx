import { ToggleButton } from "primereact/togglebutton";
import { Controller, useFormContext } from "react-hook-form";

interface ToggleAfficherCacherProps {
    name: string;
  }
  
  export const ToggleAfficherCacher = ({ name }: ToggleAfficherCacherProps) => {
    const { control, watch } = useFormContext()
    return (
      <Controller
        name={name}
        control={control}
        // rules={{ required: 'Value is required.' }}
        render={({ field }) => (
          <div className="flex flex-column align-items-center gap-2">
            <ToggleButton
              onLabel="Cacher"
              offLabel="Afficher"
              // onIcon='pi pi-check'
              // offIcon='pi pi-times'
              id={field.name}
              checked={watch(name)}
              onChange={field.onChange}
              style={{
                fontSize: '14px',
              }}
            />
          </div>
        )}
      />
    )
  }