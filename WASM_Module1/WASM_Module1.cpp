// WASM_Module1.cpp
// -----------------------------------------------------------------------------
// Standalone WASM module for Microsoft Flight Simulator (MSFS).
// Demonstrates how to:
//   - Open and close a SimConnect connection
//   - Subscribe to simulation data (ON GROUND, TIME OF DAY)
//   - Force L:Vars every frame (e.g., SOUND VOLUME, custom flags)
//   - Map input events (keyboard key "M") using EX1
//   - Log and react to SimConnect exceptions
// -----------------------------------------------------------------------------

#include <MSFS/MSFS.h>
#include <MSFS/MSFS_WindowsTypes.h>
#include <SimConnect.h>

#include <MSFS/Legacy/gauges.h>
#include "WASM_Module1.h"

#include <string.h>
// -----------------------------------------------------------------------------
// Module name/version metadata
// -----------------------------------------------------------------------------
const char* WASM_Name = "Test_WASMs";
const char* WASM_Version = "00.01";

HANDLE g_hSimConnect; // Global SimConnect handle

// -----------------------------------------------------------------------------
// SimConnect Event IDs
//
enum eEvents {
    EVENT_FLIGHT_LOADED = 1, // Triggered when a flight is loaded
    EVENT_KEY_M = 2        // Custom client event mapped to "M" key (EX1)
};

// -----------------------------------------------------------------------------
// SimConnect Data Definition IDs
// -----------------------------------------------------------------------------
enum eDataDefId {
    DEF_ONGROUND = 1, // Simulation variable: SIM ON GROUND
    DEF_TOD = 2       // Simulation variable: TIME OF DAY
};

// -----------------------------------------------------------------------------
// SimConnect Request IDs
// -----------------------------------------------------------------------------
enum eRequestId {
    REQ_ONGROUND = 1, // Request ID for ON GROUND updates
    REQ_TOD = 2       // Request ID for TIME OF DAY updates
};

// -----------------------------------------------------------------------------
// SimConnect Groups
// -----------------------------------------------------------------------------
enum eGroups {
    GROUP_KEYS = 1, // Notification group for client events
    INPUT_KEYS = 1  // Input group (keyboard mappings)
};

// -----------------------------------------------------------------------------
// Data structures received from SimConnect
// -----------------------------------------------------------------------------
#pragma pack(push, 1)
struct OnGroundData { int32_t onGround; };   // Boolean: 0 = air, 1 = ground
struct TimeOfDayData { int32_t tod; };    // Enum: 0=Dawn,1=Day,2=Dusk,3=Night
#pragma pack(pop)

// -----------------------------------------------------------------------------
// Forward declarations
// -----------------------------------------------------------------------------
void CALLBACK MyDispatchProc(SIMCONNECT_RECV* pData, DWORD cbData, void* pContext);
void ForceSoundVolumeValue(void);  // Función para forzar el valor cada frame
void ForceTimeOfDayValue(void);    // Nueva función para forzar TIME OF DAY

// -----------------------------------------------------------------------------
// Cached values to avoid excessive logging
// -----------------------------------------------------------------------------
static int s_lastOnGround = -1;   // 0/1 SIM ON GROUND
static int s_lastLanding = -1;   // 0/1 L:c53_landing
static int s_lastTODEnum = -1;   // 0..3 TIME OF DAY
static int s_lastIsDay = -1;   // 0/1 L:c53_is_day

// -----------------------------------------------------------------------------
// Utility: Human-readable names for SimConnect exceptions
// -----------------------------------------------------------------------------
static const char* SimConnectExceptionName(DWORD e) {
    switch (e) {
    case SIMCONNECT_EXCEPTION_NONE: return "NONE";
    case SIMCONNECT_EXCEPTION_ERROR: return "ERROR";
    case SIMCONNECT_EXCEPTION_SIZE_MISMATCH: return "SIZE_MISMATCH";
    case SIMCONNECT_EXCEPTION_UNRECOGNIZED_ID: return "UNRECOGNIZED_ID";
    case SIMCONNECT_EXCEPTION_UNOPENED: return "UNOPEN";
    case SIMCONNECT_EXCEPTION_VERSION_MISMATCH: return "VERSION_MISMATCH";
    case SIMCONNECT_EXCEPTION_NAME_UNRECOGNIZED: return "NAME_UNRECOGNIZED";
    case SIMCONNECT_EXCEPTION_TOO_MANY_GROUPS: return "TOO_MANY_GROUPS";
    case SIMCONNECT_EXCEPTION_TOO_MANY_EVENT_NAMES: return "TOO_MANY_EVENT_NAMES";
    case SIMCONNECT_EXCEPTION_EVENT_ID_DUPLICATE: return "EVENT_ID_DUPLICATE";
    case SIMCONNECT_EXCEPTION_TOO_MANY_MAPS: return "TOO_MANY_MAPS";
    case SIMCONNECT_EXCEPTION_TOO_MANY_OBJECTS: return "TOO_MANY_OBJECTS";
    case SIMCONNECT_EXCEPTION_TOO_MANY_REQUESTS: return "TOO_MANY_REQUESTS";
    case SIMCONNECT_EXCEPTION_INVALID_DATA_TYPE: return "INVALID_DATA_TYPE";
    case SIMCONNECT_EXCEPTION_INVALID_DATA_SIZE: return "INVALID_DATA_SIZE";
    case SIMCONNECT_EXCEPTION_DATA_ERROR: return "DATA_ERROR";
    case SIMCONNECT_EXCEPTION_INVALID_ENUM: return "INVALID_ENUM";
    case SIMCONNECT_EXCEPTION_DEFINITION_ERROR: return "DEFINITION_ERROR";
    case SIMCONNECT_EXCEPTION_DUPLICATE_ID: return "DUPLICATE_ID";
    case SIMCONNECT_EXCEPTION_OUT_OF_BOUNDS: return "OUT_OF_BOUNDS";
    case SIMCONNECT_EXCEPTION_ALREADY_SUBSCRIBED: return "ALREADY_SUBSCRIBED";
    default: return "UNKNOWN";
    }
}

// -----------------------------------------------------------------------------
// ForceSoundVolumeValue
// Forces the custom L:Var "C53_SOUND_VOLUME" to 100 each frame
// -----------------------------------------------------------------------------
void ForceSoundVolumeValue(void)
{
    // Forzar L:C53_SOUND_VOLUME a 100 cada frame
    execute_calculator_code("100 (>L:C53_SOUND_VOLUME, number)", nullptr, nullptr, nullptr);
}
// -----------------------------------------------------------------------------
// ForceTimeOfDayValue
// Updates custom L:Var "c53_is_day" based on TIME OF DAY enum
// -----------------------------------------------------------------------------
void ForceTimeOfDayValue(void)
{
    double todEnum = 0.0;
    execute_calculator_code("(TIME OF DAY, enum)", &todEnum, nullptr, nullptr);

    int isDay = ((int)todEnum == 1) ? 1 : 0;

    // Write L:Var
    if (isDay == 1) {
        execute_calculator_code("1 (>L:c53_is_day, bool)", nullptr, nullptr, nullptr);
    }
    else {
        execute_calculator_code("0 (>L:c53_is_day, bool)", nullptr, nullptr, nullptr);
    }

    // Debug log
    fprintf(stderr, "[ADRIAN] TIME OF DAY enum = %d, L:c53_is_day = %d\n",
        (int)todEnum, isDay);
}

// -----------------------------------------------------------------------------
// module_init
// Entry point when the WASM module is loaded
// - Opens SimConnect
// - Subscribes to "SIM ON GROUND" and "TIME OF DAY"
// - Maps "M" key with EX1
// -----------------------------------------------------------------------------
extern "C" MSFS_CALLBACK void module_init(void)
{
    if (SimConnect_Open(&g_hSimConnect, "Standalone Module", nullptr, 0, 0, 0) != S_OK) {
        fprintf(stderr, "Could not open SimConnect connection.\n");
        return;
    }

    // Subscribe to system event: Flight loaded
    SimConnect_SubscribeToSystemEvent(g_hSimConnect, EVENT_FLIGHT_LOADED, "FlightLoaded");
    // --- Define and request SIM ON GROUND ---
    if (SimConnect_AddToDataDefinition(
        g_hSimConnect, DEF_ONGROUND, "SIM ON GROUND", "Bool",
        SIMCONNECT_DATATYPE_INT32) != S_OK)
    {
        fprintf(stderr, "AddToDataDefinition(ONGROUND) failed.\n");
        return;
    }

    if (SimConnect_RequestDataOnSimObject(
        g_hSimConnect, REQ_ONGROUND, DEF_ONGROUND,
        SIMCONNECT_OBJECT_ID_USER, SIMCONNECT_PERIOD_SIM_FRAME,
        SIMCONNECT_DATA_REQUEST_FLAG_CHANGED) != S_OK)
    {
        fprintf(stderr, "RequestDataOnSimObject(ONGROUND) failed.\n");
        return;
    }

    // --- Define and request TIME OF DAY ---
    HRESULT hr = SimConnect_AddToDataDefinition(
        g_hSimConnect, DEF_TOD, "TIME OF DAY", "Enum",
        SIMCONNECT_DATATYPE_INT32
    );
    if (hr != S_OK) {
        // Fallback if "Enum" not supported
        hr = SimConnect_AddToDataDefinition(
            g_hSimConnect, DEF_TOD, "TIME OF DAY", "Number",
            SIMCONNECT_DATATYPE_INT32
        );
        if (hr != S_OK) {
            fprintf(stderr, "AddToDataDefinition(TIME OF DAY) failed.\n");
            return;
        }
    }

    if (SimConnect_RequestDataOnSimObject(
        g_hSimConnect, REQ_TOD, DEF_TOD,
        SIMCONNECT_OBJECT_ID_USER, SIMCONNECT_PERIOD_SIM_FRAME,
        SIMCONNECT_DATA_REQUEST_FLAG_CHANGED) != S_OK)
    {
        fprintf(stderr, "RequestDataOnSimObject(TIME OF DAY) failed.\n");
        return;
    }

    // --- Map "M" key to custom client event using EX1 ---
    HRESULT hrMapEvt = SimConnect_MapClientEventToSimEvent(g_hSimConnect, EVENT_KEY_M, nullptr);
    if (hrMapEvt != S_OK) {
        fprintf(stderr, "MapClientEventToSimEvent(EVENT_KEY_M) fallo hr=0x%08X\n", (unsigned)hrMapEvt);
    }

    
    HRESULT hrAdd = SimConnect_AddClientEventToNotificationGroup(g_hSimConnect, GROUP_KEYS, EVENT_KEY_M, FALSE);
    if (hrAdd != S_OK) {
        fprintf(stderr, "AddClientEventToNotificationGroup fallo hr=0x%08X\n", (unsigned)hrAdd);
    }
    SimConnect_SetNotificationGroupPriority(g_hSimConnect, GROUP_KEYS, SIMCONNECT_GROUP_PRIORITY_HIGHEST);

    
    HRESULT hrKey = SimConnect_MapInputEventToClientEvent_EX1(
        g_hSimConnect, INPUT_KEYS, "M", EVENT_KEY_M 
        
    );
    if (hrKey != S_OK) {
        fprintf(stderr, "MapInputEventToClientEvent_EX1(\"M\") fallo hr=0x%08X\n", (unsigned)hrKey);
    }

    
    SimConnect_SetInputGroupPriority(g_hSimConnect, INPUT_KEYS, SIMCONNECT_GROUP_PRIORITY_HIGHEST);
    SimConnect_SetInputGroupState(g_hSimConnect, INPUT_KEYS, SIMCONNECT_STATE_ON);

    // Dispatcher
    if (SimConnect_CallDispatch(g_hSimConnect, MyDispatchProc, nullptr) != S_OK) {
        fprintf(stderr, "Could not set dispatch proc.\n");
        return;
    }

    fprintf(stderr, "[ADRIAN] init OK. ONGROUND + TIME OF DAY (CHANGED) y key M (EX1) \n");
}

// -----------------------------------------------------------------------------
// module_deinit
// Cleanup when the module is unloaded
// -----------------------------------------------------------------------------
extern "C" MSFS_CALLBACK void module_deinit(void)
{
    if (!g_hSimConnect) return;
    if (SimConnect_Close(g_hSimConnect) != S_OK)
        fprintf(stderr, "Could not close SimConnect connection.\n");
    g_hSimConnect = 0;
}

// -----------------------------------------------------------------------------
// MyDispatchProc
// Central SimConnect dispatcher
// Handles incoming events, exceptions, and sim data updates
// -----------------------------------------------------------------------------
void CALLBACK MyDispatchProc(SIMCONNECT_RECV* pData, DWORD cbData, void* pContext)
{
    switch (pData->dwID)
    {
    case SIMCONNECT_RECV_ID_EVENT_FILENAME:
    {
        auto* evt = (SIMCONNECT_RECV_EVENT_FILENAME*)pData;
        if (evt->uEventID == EVENT_FLIGHT_LOADED)
            fprintf(stderr, "ADRIAN New Flight Loaded: %s\n", evt->szFileName);
        break;
    }

    case SIMCONNECT_RECV_ID_EVENT:
    {
        auto* evt = (SIMCONNECT_RECV_EVENT*)pData;
        if (evt->uEventID == EVENT_KEY_M) {
            fprintf(stderr, "aprete m\n");
        }
        break;
    }

    case SIMCONNECT_RECV_ID_EXCEPTION:
    {
        auto* ex = (SIMCONNECT_RECV_EXCEPTION*)pData;
        fprintf(stderr,
            "[SimConnect EXCEPTION] id=%u (%s) sendID=%u index=%u\n",
            ex->dwException,
            SimConnectExceptionName(ex->dwException),
            ex->dwSendID,
            ex->dwIndex
        );
        break;
    }

    case SIMCONNECT_RECV_ID_SIMOBJECT_DATA:
    {
        auto* recv = (SIMCONNECT_RECV_SIMOBJECT_DATA*)pData;

        // ====== SIM ON GROUND ======
        if (recv->dwRequestID == REQ_ONGROUND)
        {
            const OnGroundData* d = (const OnGroundData*)&recv->dwData;
            const int onGround = d->onGround ? 1 : 0;

            // Force values every frame
            ForceSoundVolumeValue();
            ForceTimeOfDayValue();

            if (onGround != s_lastOnGround) {
                fprintf(stderr, "[ADRIAN] SIM ON GROUND = %d\n", onGround);
                s_lastOnGround = onGround;
            }

            // Update LVar for landing flag
            execute_calculator_code(
                onGround ? "1 (>L:c53_landing, bool)" : "0 (>L:c53_landing, bool)",
                nullptr, nullptr, nullptr
            );

            
            double lval = 0.0;
            execute_calculator_code("(L:c53_landing, bool)", &lval, nullptr, nullptr);
            const int landing = (lval >= 0.5) ? 1 : 0;
            if (landing != s_lastLanding) {
                fprintf(stderr, "[ADRIAN] L:c53_landing = %d\n", landing);
                s_lastLanding = landing;
            }
        }
        // --- TIME OF DAY ---
        else if (recv->dwRequestID == REQ_TOD)
        {
            const TimeOfDayData* t = (const TimeOfDayData*)&recv->dwData;
            const int todEnum = t->tod;  // 0=Dawn,1=Day,2=Dusk,3=Night

            if (todEnum != s_lastTODEnum) {
                fprintf(stderr, "[ADRIAN] TIME OF DAY enum = %d (0=Dawn,1=Day,2=Dusk,3=Night)\n", todEnum);
                s_lastTODEnum = todEnum;
            }

            
            const int isDay = (todEnum == 1) ? 1 : 0;

            execute_calculator_code(
                isDay ? "1 (>L:c53_is_day, bool)" : "0 (>L:c53_is_day, bool)",
                nullptr, nullptr, nullptr
            );

            // Log L:c53_is_day 
            double lday = 0.0;
            execute_calculator_code("(L:c53_is_day, bool)", &lday, nullptr, nullptr);
            const int isDayBool = (lday >= 0.5) ? 1 : 0;
            if (isDayBool != s_lastIsDay) {
                fprintf(stderr, "[ADRIAN] L:c53_is_day = %d\n", isDayBool);
                s_lastIsDay = isDayBool;
            }
        }

        break;
    }

    default: break;
    }
}