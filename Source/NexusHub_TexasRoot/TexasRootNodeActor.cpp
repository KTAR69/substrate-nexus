// Fill out your copyright notice in the Description page of Project Settings.

#include "TexasRootNodeActor.h"
#include "HttpModule.h"
#include "Interfaces/IHttpRequest.h"
#include "Interfaces/IHttpResponse.h"
#include "Serialization/JsonSerializer.h"
#include "Dom/JsonObject.h"

ATexasRootNodeActor::ATexasRootNodeActor()
{
    PrimaryActorTick.bCanEverTick = true;
}

void ATexasRootNodeActor::BeginPlay()
{
    Super::BeginPlay();

    // Ignition: Start the 15Hz Polling Heartbeat (66ms interval)
    GetWorldTimerManager().SetTimer(PollingTimerHandle, this, &ATexasRootNodeActor::PollChirpSensor, 0.066f, true);
}

void ATexasRootNodeActor::PollChirpSensor()
{
    TSharedRef<IHttpRequest, ESPMode::ThreadSafe> Request = FHttpModule::Get().CreateRequest();

    // THE HANDSHAKE: Targeting the San Antonio live_spikes collection
    // Note: Replace with actual endpoint in production or make configurable
    Request->SetURL("https://YOUR_MONGO_REST_ENDPOINT/live_spikes?node=sa_hq_node_01");
    Request->SetVerb("GET");

    Request->OnProcessRequestComplete().BindLambda([this](FHttpRequestPtr Req, FHttpResponsePtr Res, bool bSuccess) {
        if (bSuccess && Res.IsValid()) {
            TSharedPtr<FJsonObject> JsonObject;
            TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(Res->GetContentAsString());

            if (FJsonSerializer::Deserialize(Reader, JsonObject) && JsonObject.IsValid()) {
                // PARSING THE BRAID: Extracting High-Integrity Telemetry
                double Intensity = 0.0;
                if (JsonObject->HasField("intensity"))
                {
                    Intensity = JsonObject->GetNumberField("intensity");
                }

                if (JsonObject->HasField("vectors"))
                {
                    TSharedPtr<FJsonObject> Vec = JsonObject->GetObjectField("vectors");
                    if (Vec.IsValid())
                    {
                        FVector CurVectors(Vec->GetNumberField("x"), Vec->GetNumberField("y"), Vec->GetNumberField("z"));

                        // TRIGGER: Passing data to the MPC (Material Parameter Collection) via Blueprint
                        OnVibrationSpikeReceived((float)Intensity, CurVectors);
                    }
                }
            }
        }
    });
    Request->ProcessRequest();
}

void ATexasRootNodeActor::PushSimple6GNotification(FString Message)
{
    // Trigger the simplified Blueprint event that accepts a raw string
    OnSimple6GNotificationReceived(Message);
}
