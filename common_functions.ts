import service_uuids from './assets/bluetooth-numbers-database/service_uuids.json'
import char_uuids from './assets/bluetooth-numbers-database/characteristic_uuids.json'
import descriptor_uuids from './assets/bluetooth-numbers-database/descriptor_uuids.json'

type uuid_type = "service"|"descriptor"|"characteristic";
export function resolveUUID(uuid:string, type:uuid_type){
  const src = type == "service" ? service_uuids : type == "characteristic" ? char_uuids : descriptor_uuids;
  const suuid = uuid.slice(4,8);
  const svc = src.find(service=>{
      return service.uuid.toUpperCase() == uuid.toUpperCase() || service.uuid.toUpperCase() == suuid.toUpperCase();
  })
  return svc? svc.name : uuid;
}