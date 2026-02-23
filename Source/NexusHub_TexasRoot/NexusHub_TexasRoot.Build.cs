// Copyright Epic Games, Inc. All Rights Reserved.

using UnrealBuildTool;

public class NexusHub_TexasRoot : ModuleRules
{
    public NexusHub_TexasRoot(ReadOnlyTargetRules Target) : base(Target)
    {
        PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;

        PublicDependencyModuleNames.AddRange(new string[] { "Core", "CoreUObject", "Engine", "InputCore", "HTTP", "Json", "JsonUtilities" });

        PrivateDependencyModuleNames.AddRange(new string[] {  });
    }
}
