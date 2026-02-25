// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "TexasRootNodeActor.generated.h"

/**
 * ATexasRootNodeActor
 * Connects to the San Antonio sensor network (MongoDB) to visualize seismic/movement data.
 * Polls at 15Hz for real-time terrain displacement.
 */
UCLASS()
class NEXUSHUB_TEXASROOT_API ATexasRootNodeActor : public AActor
{
    GENERATED_BODY()

public:
    ATexasRootNodeActor();

protected:
    virtual void BeginPlay() override;

public:
    // Timer handle for the 15Hz polling loop
    FTimerHandle PollingTimerHandle;

    // Function to poll the MongoDB endpoint
    void PollChirpSensor();

    /**
     * Blueprint event triggered when valid telemetry is received.
     * Use this to drive MPC or material parameters.
     * @param Intensity The vibration intensity (scalar).
     * @param CurrentVectors The displacement vector (x, y, z).
     */
    UFUNCTION(BlueprintImplementableEvent, Category = "TexasRoot|Telemetry")
    void OnVibrationSpikeReceived(float Intensity, FVector CurrentVectors);
};
