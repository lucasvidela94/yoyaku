export namespace models {
	
	export class Paciente {
	    id: number;
	    nombre: string;
	    telefono: string;
	    email?: string;
	    notas?: string;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new Paciente(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.nombre = source["nombre"];
	        this.telefono = source["telefono"];
	        this.email = source["email"];
	        this.notas = source["notas"];
	        this.createdAt = this.convertValues(source["createdAt"], null);
	        this.updatedAt = this.convertValues(source["updatedAt"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Turno {
	    id: number;
	    pacienteId: number;
	    paciente?: Paciente;
	    // Go type: time
	    fecha: any;
	    hora: string;
	    duracion: number;
	    motivo: string;
	    estado: string;
	    notas?: string;
	    riesgoNoShow: boolean;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new Turno(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.pacienteId = source["pacienteId"];
	        this.paciente = this.convertValues(source["paciente"], Paciente);
	        this.fecha = this.convertValues(source["fecha"], null);
	        this.hora = source["hora"];
	        this.duracion = source["duracion"];
	        this.motivo = source["motivo"];
	        this.estado = source["estado"];
	        this.notas = source["notas"];
	        this.riesgoNoShow = source["riesgoNoShow"];
	        this.createdAt = this.convertValues(source["createdAt"], null);
	        this.updatedAt = this.convertValues(source["updatedAt"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class AgendaDia {
	    fecha: string;
	    turnos: Turno[];
	    atrasoMinutos: number;
	    totalTurnos: number;
	    turnosPendientes: number;
	
	    static createFrom(source: any = {}) {
	        return new AgendaDia(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.fecha = source["fecha"];
	        this.turnos = this.convertValues(source["turnos"], Turno);
	        this.atrasoMinutos = source["atrasoMinutos"];
	        this.totalTurnos = source["totalTurnos"];
	        this.turnosPendientes = source["turnosPendientes"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Configuracion {
	    id: number;
	    nombreConsultorio: string;
	    nombreMedico: string;
	    telefonoConsultorio: string;
	    direccion: string;
	    mensajeConfirmacion: string;
	    mensajeRecordatorio: string;
	    mensajeDemora: string;
	    horarioAtencion: string;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new Configuracion(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.nombreConsultorio = source["nombreConsultorio"];
	        this.nombreMedico = source["nombreMedico"];
	        this.telefonoConsultorio = source["telefonoConsultorio"];
	        this.direccion = source["direccion"];
	        this.mensajeConfirmacion = source["mensajeConfirmacion"];
	        this.mensajeRecordatorio = source["mensajeRecordatorio"];
	        this.mensajeDemora = source["mensajeDemora"];
	        this.horarioAtencion = source["horarioAtencion"];
	        this.updatedAt = this.convertValues(source["updatedAt"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class InfoLicencia {
	    estado: string;
	    // Go type: time
	    fechaActivacion?: any;
	    // Go type: time
	    fechaExpiracion?: any;
	    diasRestantes: number;
	    mensaje: string;
	
	    static createFrom(source: any = {}) {
	        return new InfoLicencia(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.estado = source["estado"];
	        this.fechaActivacion = this.convertValues(source["fechaActivacion"], null);
	        this.fechaExpiracion = this.convertValues(source["fechaExpiracion"], null);
	        this.diasRestantes = source["diasRestantes"];
	        this.mensaje = source["mensaje"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	

}

